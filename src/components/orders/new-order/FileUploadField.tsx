/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    FilePlus2,
    UploadCloud,
    X,
    Loader2,
    Link as LinkIcon,
    Square,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    ExternalLink,
    Clipboard,
    FileText,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import ApiError from '@/components/shared/ApiError';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
    label: string;
    required?: boolean;
    description?: string;
    orderID?: string;
    userID: string;
    quoteID?: string;
    mode?: 'order' | 'quote' | 'delivery';
    title?: string;
    uploader?: 'admin' | 'user';
};

type InitiateResponse = {
    uploadId: string;
    objectKey: string;
    parts: { partNumber: number; url: string }[];
    partSize: number;
    publicUrl: string;
    folderPath: string;
};

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploadField({
    label,
    required = false,
    description = '',
    orderID,
    userID,
    quoteID,
    mode,
    title,
    uploader,
}: Props) {
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = useFormContext();

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTime, setUploadTime] = useState(0);
    const [useExternalLink, setUseExternalLink] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const currentValue = watch('downloadLink');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const canceledRef = useRef(false);

    const api = useMemo(
        () =>
            axios.create({
                baseURL: '',
                timeout: 1000 * 60 * 60,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                withCredentials: false,
            }),
        []
    );

    // Decide mode on the client (UI/accept types). Server still re-validates.
    const effectiveMode = useMemo<'order' | 'quote' | 'delivery'>(
        () => (typeof mode === 'string' ? mode : orderID ? 'order' : 'quote'),
        [mode, orderID]
    );

    useEffect(() => {
        return () => {
            previewUrls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [previewUrls]);

    useEffect(() => {
        if (uploadState === 'uploading') {
            const started = Date.now();
            timerRef.current = setInterval(() => {
                setUploadTime(Math.floor((Date.now() - started) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (uploadState === 'idle') {
                setUploadTime(0);
                setUploadProgress(0);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [uploadState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    const absoluteUrl = (path: string) => {
        const base =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (typeof window !== 'undefined' ? window.location.origin : '');
        try {
            return new URL(path, base).toString();
        } catch {
            return `${base}${path}`;
        }
    };

    const makePreviewUrls = useCallback(
        (files: File[]) => {
            // revoke old
            previewUrls.forEach((u) => URL.revokeObjectURL(u));
            const urls = files
                .filter((f) => f.type.startsWith('image/'))
                .map((f) => URL.createObjectURL(f));
            setPreviewUrls(urls);
        },
        [previewUrls]
    );

    const doUpload = async (files: File[]) => {
        // timestamps & title slug
        const dateStr = new Date();
        const today = `${dateStr.getFullYear()}-${String(
            dateStr.getMonth() + 1
        ).padStart(2, '0')}-${String(dateStr.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(dateStr.getHours()).padStart(2, '0')}${String(
            dateStr.getMinutes()
        ).padStart(2, '0')}${String(dateStr.getSeconds()).padStart(2, '0')}`;
        const titleSlug =
            (title || '')
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-') || timeStr;

        // legacy kind/id for non-delivery flows (server will use these)
        const kind =
            effectiveMode === 'delivery'
                ? 'deliveries'
                : effectiveMode === 'order'
                ? 'orders'
                : 'quotes';
        const legacyId =
            effectiveMode === 'delivery'
                ? `${orderID}/${today}/${titleSlug}` // client-only convenience; server ignores when mode='delivery'
                : orderID || quoteID;

        if (!userID || !legacyId) throw new Error('Missing userID or id');

        setUploadState('uploading');
        setUploadProgress(0);
        setErrorMessage('');
        setUploadedFiles(files);
        canceledRef.current = false;
        makePreviewUrls(files);

        const stored: { key: string; url: string; folderPath: string }[] = [];

        try {
            for (let idx = 0; idx < files.length; idx++) {
                if (canceledRef.current)
                    throw new Error('Upload aborted by user');

                const file = files[idx];

                // Build payload: for deliveries, use the *new* fields the server expects
                const payload =
                    effectiveMode === 'delivery'
                        ? {
                              fileName: file.name,
                              fileType: file.type || 'application/octet-stream',
                              fileSize: file.size,
                              userID, // optional for metadata; server path is derived from orderID/date/title
                              mode: 'delivery' as const,
                              orderID,
                              title,
                              uploader, // 'admin' ideally; server should re-check role
                          }
                        : {
                              fileName: file.name,
                              fileType: file.type || 'application/octet-stream',
                              fileSize: file.size,
                              userID,
                              kind, // 'orders' | 'quotes'
                              id: orderID || quoteID,
                          };

                const init = await api
                    .post<InitiateResponse>('/api/uploads/initiate', payload)
                    .then((r) => r.data);

                const { uploadId, objectKey, parts, partSize, folderPath } =
                    init;

                const etags: { ETag: string; PartNumber: number }[] = [];
                let uploadedBytes = 0;
                abortControllerRef.current = new AbortController();

                for (const p of parts) {
                    if (canceledRef.current)
                        throw new Error('Upload aborted by user');

                    const start = (p.partNumber - 1) * partSize;
                    const end = Math.min(start + partSize, file.size);
                    const blobPart = file.slice(start, end);

                    const res = await axios.put(p.url, blobPart, {
                        signal: abortControllerRef.current.signal,
                        headers: { 'Content-Type': 'application/octet-stream' },
                        onUploadProgress: (evt) => {
                            if (!evt.loaded) return;

                            const currentTotal = uploadedBytes + evt.loaded;
                            const perFilePct = Math.min(
                                100,
                                Math.round((currentTotal / file.size) * 100)
                            );
                            const overallPct = Math.min(
                                100,
                                Math.round(
                                    ((idx + perFilePct / 100) / files.length) *
                                        100
                                )
                            );
                            setUploadProgress(
                                files.length > 1 ? overallPct : perFilePct
                            );
                        },
                    });

                    const raw =
                        (res.headers as any).etag ||
                        (res.headers as any).ETag ||
                        (res.headers as any)['x-amz-meta-etag'];
                    const cleanETag = String(raw || '').replaceAll('"', '');
                    if (!cleanETag) {
                        throw new Error(
                            'Missing ETag from S3 response (check bucket CORS ExposeHeaders: ["ETag", ...]).'
                        );
                    }

                    etags.push({ ETag: cleanETag, PartNumber: p.partNumber });
                    uploadedBytes += blobPart.size;
                }

                await api.post('/api/uploads/complete', {
                    uploadId,
                    objectKey,
                    parts: etags.sort((a, b) => a.PartNumber - b.PartNumber),
                });

                const downloadLink = `/api/files/dl?key=${encodeURIComponent(
                    objectKey
                )}&name=${encodeURIComponent(file.name)}`;

                stored.push({ key: objectKey, url: downloadLink, folderPath });
            }

            const result = {
                folderPath: stored[0]?.folderPath ?? '',
                files: stored,
            };

            // Delivery => zip the whole folder for a single auto-download link.
            const zipName = `order-${orderID}-${today}${
                title ? '-' + titleSlug : ''
            }.zip`;

            const linkToSet =
                effectiveMode === 'delivery'
                    ? `/api/files/zip?prefix=${encodeURIComponent(
                          result.folderPath
                      )}&name=${encodeURIComponent(zipName)}`
                    : result.files.length === 1
                    ? result.files[0].url
                    : result.folderPath; // (keep legacy multi-file behavior for orders/quotes)

            setValue('downloadLink', absoluteUrl(linkToSet));
            setValue('images', result.files.length);
            setUploadState('success');
            setUploadProgress(100);

            toast.success(
                `${uploadedFiles.length} file${
                    uploadedFiles.length > 1 ? 's' : ''
                } uploaded successfully!`
            );

            return result;
        } catch (error: any) {
            setUploadState('error');
            const msg =
                error?.response?.data?.message ||
                (error?.message?.includes('aborted')
                    ? 'Upload canceled'
                    : error?.message) ||
                'Failed to upload files';
            setErrorMessage(msg);
            toast.error(msg);
            throw error;
        } finally {
            abortControllerRef.current = null;
        }
    };

    const abortUpload = () => {
        canceledRef.current = true;
        try {
            abortControllerRef.current?.abort();
        } catch {}
        setUploadState('idle');
        setUploadedFiles([]);
    };

    const onCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Link copied to clipboard!');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        // For deliveries, accept anything; for order/quote, images only (previous behavior)
        accept:
            effectiveMode === 'delivery'
                ? undefined
                : {
                      'image/*': [
                          '.jpeg',
                          '.jpg',
                          '.png',
                          '.gif',
                          '.bmp',
                          '.tiff',
                          '.webp',
                      ],
                  },
        multiple: true,
        maxSize: 5 * 1024 * 1024 * 1024,
        disabled: useExternalLink || uploadState === 'uploading',
        onDropAccepted: async (acceptedFiles) => {
            if (!acceptedFiles.length) return;
            try {
                await doUpload(acceptedFiles);
            } catch (error) {
                ApiError(error);
            }
        },
        onDropRejected: (rejections) => {
            rejections.forEach((r) => {
                if (r.errors?.length) toast.error(r.errors[0].message);
            });
        },
    });

    const handleRemove = () => {
        setValue('downloadLink', '');
        setValue('images', 0);
        setUseExternalLink(false);
        setUploadState('idle');
        setUploadedFiles([]);
        setErrorMessage('');
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setPreviewUrls([]);
    };

    const resetUpload = () => {
        setUploadState('idle');
        setUploadedFiles([]);
        setErrorMessage('');
        setValue('downloadLink', '');
        setValue('images', 0);
    };

    // Helper to determine if current value is likely an image URL
    const isImageUrl = (url: string) => {
        return /\.(jpg|jpeg|png|gif|bmp|tiff|webp)(\?|$)/i.test(url);
    };

    return (
        <div className="space-y-5 max-w-5xl h-[80vh] overflow-y-auto">
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </label>
                {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="inline-flex items-center rounded-xl bg-muted/60 p-1.5 shadow-sm">
                <button
                    type="button"
                    disabled={uploadState === 'uploading'}
                    onClick={() => setUseExternalLink(false)}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                        !useExternalLink
                            ? 'bg-background shadow-md text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                >
                    <UploadCloud className="h-4 w-4" />
                    Upload files
                </button>
                <button
                    type="button"
                    disabled={uploadState === 'uploading'}
                    onClick={() => setUseExternalLink(true)}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                        useExternalLink
                            ? 'bg-background shadow-md text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                >
                    <LinkIcon className="h-4 w-4" />
                    External link
                </button>
            </div>

            {useExternalLink ? (
                <div className="space-y-3">
                    <Input
                        placeholder="https://dropbox.com/... or https://drive.google.com/..."
                        className="h-12 text-base border-2 focus:border-primary transition-colors"
                        {...register('downloadLink', {
                            validate: (value) => {
                                if (!value && required)
                                    return 'Link is required';
                                if (
                                    value &&
                                    !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(
                                        value
                                    )
                                ) {
                                    return 'Please enter a valid URL';
                                }
                                return true;
                            },
                        })}
                        disabled={uploadState === 'uploading'}
                    />
                    {errors['downloadLink'] && (
                        <p className="flex items-center gap-2 text-sm text-destructive font-medium">
                            <AlertCircle className="h-4 w-4" />
                            {(errors['downloadLink']?.message as string) || ''}
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <motion.div
                        initial={false}
                        animate={{
                            boxShadow:
                                uploadState === 'uploading'
                                    ? '0 0 0 2px hsl(var(--primary)/.3)'
                                    : '0 0 0 0 rgba(0,0,0,0)',
                        }}
                        className="rounded-2xl"
                    >
                        <div
                            {...getRootProps()}
                            className={cn(
                                'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
                                isDragActive
                                    ? 'border-primary bg-primary/10 scale-[1.02]'
                                    : 'border-muted-foreground/30 hover:border-muted-foreground/50',
                                uploadState === 'uploading' &&
                                    'opacity-70 pointer-events-none',
                                uploadState === 'success' &&
                                    'border-green-300 bg-green-50/50 dark:bg-green-950/20',
                                uploadState === 'error' &&
                                    'border-red-300 bg-red-50/50 dark:bg-red-950/20'
                            )}
                        >
                            <input {...getInputProps()} />

                            <AnimatePresence mode="wait">
                                {uploadState === 'uploading' && (
                                    <motion.div
                                        key="uploading"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-center">
                                            <div className="p-3 rounded-full bg-primary/10">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm font-semibold">
                                                <span>
                                                    Uploading{' '}
                                                    {uploadedFiles.length} file
                                                    {uploadedFiles.length > 1
                                                        ? 's'
                                                        : ''}
                                                    …
                                                </span>
                                                <span className="text-primary">
                                                    {uploadProgress}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={uploadProgress}
                                                className="h-2.5"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>
                                                    {formatTime(uploadTime)}{' '}
                                                    elapsed
                                                </span>
                                                <span>
                                                    {formatFileSize(
                                                        uploadedFiles.reduce(
                                                            (acc, f) =>
                                                                acc + f.size,
                                                            0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={abortUpload}
                                            className="hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Square className="mr-2 h-4 w-4" />
                                            Cancel upload
                                        </Button>
                                    </motion.div>
                                )}

                                {(uploadState === 'idle' || !uploadState) && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <div
                                                className={cn(
                                                    'p-4 rounded-full transition-all duration-300',
                                                    isDragActive
                                                        ? 'bg-primary/20 scale-110'
                                                        : 'bg-muted/70'
                                                )}
                                            >
                                                <UploadCloud
                                                    className={cn(
                                                        'h-9 w-9 transition-colors',
                                                        isDragActive
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-foreground text-lg">
                                                {isDragActive
                                                    ? 'Drop your files here'
                                                    : 'Upload your files'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                                                {effectiveMode === 'delivery'
                                                    ? 'Drag & drop or click to browse — up to 5GB per file'
                                                    : 'Drag & drop or click to browse — JPEG, PNG, GIF, BMP, TIFF, WEBP (max 5GB each)'}
                                            </p>
                                        </div>

                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
                                                {previewUrls.map((src, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.8,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        className="relative overflow-hidden rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={src}
                                                            alt={`Preview ${
                                                                i + 1
                                                            }`}
                                                            className="h-28 w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {uploadState === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{
                                            opacity: 0,
                                            y: 8,
                                            scale: 0.95,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: 0.1,
                                                    type: 'spring',
                                                }}
                                            >
                                                <CheckCircle2 className="h-14 w-14 text-green-500" />
                                            </motion.div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-green-700 dark:text-green-400 text-lg">
                                                Upload complete!
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {uploadedFiles.length} file
                                                {uploadedFiles.length > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                uploaded successfully in{' '}
                                                {formatTime(uploadTime)}.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {uploadState === 'error' && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <AlertCircle className="h-14 w-14 text-destructive" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-destructive text-lg">
                                                Upload failed
                                            </h3>
                                            <p className="text-sm text-muted-foreground bg-destructive/10 rounded-lg p-3">
                                                {errorMessage}
                                            </p>
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={resetUpload}
                                                className="hover:bg-primary hover:text-primary-foreground"
                                            >
                                                Try again
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemove}
                                                className="hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Clear
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {currentValue && uploadState !== 'uploading' && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r from-muted/40 to-muted/20 shadow-sm"
                        >
                            <div className="flex-shrink-0">
                                {isImageUrl(currentValue) ? (
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                ) : effectiveMode === 'delivery' ? (
                                    <Download className="h-5 w-5 text-primary" />
                                ) : (
                                    <FileText className="h-5 w-5 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="truncate text-sm font-medium"
                                    title={currentValue}
                                >
                                    {currentValue.length > 60
                                        ? `...${currentValue.slice(-57)}`
                                        : currentValue}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {uploadedFiles.length > 0
                                        ? `${uploadedFiles.length} file${
                                              uploadedFiles.length > 1
                                                  ? 's'
                                                  : ''
                                          } • ${formatFileSize(
                                              uploadedFiles.reduce(
                                                  (acc, f) => acc + f.size,
                                                  0
                                              )
                                          )}`
                                        : 'External link'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10"
                                    onClick={() => onCopy(currentValue)}
                                    title="Copy link"
                                >
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-primary/10"
                                    onClick={() =>
                                        window.open(currentValue, '_blank')
                                    }
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={handleRemove}
                                    title="Remove"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
