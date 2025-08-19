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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
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
        const isOrder = !!orderID;
        const kind = isOrder ? 'orders' : 'quotes';
        const id = isOrder ? orderID : quoteID;

        if (!userID || !id) throw new Error('Missing userID or id');

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

                const init = await api
                    .post<InitiateResponse>('/api/uploads/initiate', {
                        fileName: file.name,
                        fileType: file.type || 'application/octet-stream',
                        fileSize: file.size,
                        userID,
                        kind,
                        id,
                    })
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

            const linkToSet =
                result.files.length === 1
                    ? result.files[0].url
                    : result.folderPath;

            setValue(
                'downloadLink',
                `${process.env.NEXT_PUBLIC_BASE_URL!}${linkToSet}`
            );
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
            toast.success('Link copied');
        } catch {
            toast.error('Failed to copy');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
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

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <ImageIcon className="h-4 w-4" />
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <div className="inline-flex items-center rounded-xl bg-muted p-1">
                <button
                    type="button"
                    disabled={uploadState === 'uploading'}
                    onClick={() => setUseExternalLink(false)}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition',
                        !useExternalLink
                            ? 'bg-background shadow-sm'
                            : 'opacity-70 hover:opacity-100'
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
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition',
                        useExternalLink
                            ? 'bg-background shadow-sm'
                            : 'opacity-70 hover:opacity-100'
                    )}
                >
                    <LinkIcon className="h-4 w-4" />
                    External link
                </button>
            </div>

            {useExternalLink ? (
                <div className="space-y-2">
                    <Input
                        placeholder="https://dropbox.com/... or https://drive.google.com/..."
                        className="h-12 text-base"
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
                        <p className="flex items-center gap-2 text-sm text-destructive">
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
                                    ? '0 0 0 2px hsl(var(--primary)/.25)'
                                    : '0 0 0 0 rgba(0,0,0,0)',
                        }}
                        className="rounded-2xl"
                    >
                        <div
                            {...getRootProps()}
                            className={cn(
                                'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                                isDragActive
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted-foreground/30',
                                uploadState === 'uploading' &&
                                    'opacity-70 pointer-events-none'
                            )}
                        >
                            <input {...getInputProps()} />

                            <AnimatePresence mode="popLayout">
                                {uploadState === 'uploading' && (
                                    <motion.div
                                        key="uploading"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-center">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm font-medium">
                                                <span>
                                                    Uploading{' '}
                                                    {uploadedFiles.length} file
                                                    {uploadedFiles.length > 1
                                                        ? 's'
                                                        : ''}
                                                    …
                                                </span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <Progress
                                                value={uploadProgress}
                                                className="h-2"
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
                                        >
                                            <Square className="mr-2 h-4 w-4" />
                                            Cancel upload
                                        </Button>
                                    </motion.div>
                                )}

                                {(uploadState === 'idle' || !uploadState) && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <div
                                                className={cn(
                                                    'p-4 rounded-full transition-colors',
                                                    isDragActive
                                                        ? 'bg-primary/15'
                                                        : 'bg-muted'
                                                )}
                                            >
                                                <UploadCloud
                                                    className={cn(
                                                        'h-9 w-9',
                                                        isDragActive
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="font-semibold text-foreground">
                                                {isDragActive
                                                    ? 'Drop your files here'
                                                    : 'Upload your images'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Drag & drop or click to browse —
                                                JPEG, PNG, GIF, BMP, TIFF, WEBP
                                                (max 5GB each)
                                            </p>
                                        </div>

                                        {previewUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {previewUrls.map((src, i) => (
                                                    <div
                                                        key={i}
                                                        className="relative overflow-hidden rounded-xl border bg-background"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={src}
                                                            alt={`preview-${i}`}
                                                            className="h-28 w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {uploadState === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <CheckCircle2 className="h-14 w-14 text-green-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-green-700 dark:text-green-300">
                                                Upload complete!
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {uploadedFiles.length} file
                                                {uploadedFiles.length > 1
                                                    ? 's'
                                                    : ''}{' '}
                                                uploaded successfully.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {uploadState === 'error' && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <AlertCircle className="h-14 w-14 text-red-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-red-700 dark:text-red-300">
                                                Upload failed
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {errorMessage}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={resetUpload}
                                            >
                                                Try again
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemove}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Clear
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {currentValue && uploadState !== 'uploading' && (
                        <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/40">
                            <FilePlus2 className="h-5 w-5 text-primary flex-shrink-0" />
                            <span
                                className="truncate flex-1 text-sm"
                                title={currentValue}
                            >
                                {currentValue}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onCopy(currentValue)}
                                >
                                    <Clipboard className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                        window.open(currentValue, '_blank')
                                    }
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleRemove}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
