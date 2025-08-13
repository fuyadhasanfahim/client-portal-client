'use client';

import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { useState, useRef, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    FilePlus2,
    UploadCloud,
    X,
    Loader2,
    Link as LinkIcon,
    Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import ApiError from '@/components/shared/ApiError';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    required?: boolean;
    description?: string;
    orderID?: string;
    userID: string;
    quoteID?: string;
};

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

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTime, setUploadTime] = useState(0);
    const [useExternalLink, setUseExternalLink] = useState(false);

    const currentValue = watch('downloadLink');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const cancelRef = useRef<CancelTokenSource | null>(null);

    // axios instance tuned for large uploads
    const client = useMemo(
        () =>
            axios.create({
                baseURL: process.env.NEXT_PUBLIC_SERVER_API, // e.g. https://your-funnel-tailnet.ts.net
                timeout: 1000 * 60 * 30, // 30 min
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                withCredentials: false,
            }),
        []
    );

    // elapsed time ticker
    useEffect(() => {
        if (isUploading) {
            const started = Date.now();
            timerRef.current = setInterval(() => {
                setUploadTime(Math.floor((Date.now() - started) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setUploadTime(0);
            setUploadProgress(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isUploading]);

    const doUpload = async (files: File[]) => {
        const isOrder = !!orderID;
        const type = isOrder ? 'orders' : 'quotes';
        const id = isOrder ? orderID : quoteID;

        if (!userID || !id) throw new Error('Missing userID or id');

        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));

        // fresh cancel token each upload
        cancelRef.current = axios.CancelToken.source();
        setIsUploading(true);
        setUploadProgress(0);

        const url = `${process.env.NEXT_PUBLIC_SERVER_API!}/api/${type}/upload?userID=${encodeURIComponent(userID)}&${
            isOrder ? 'orderID' : 'quoteID'
        }=${encodeURIComponent(id!)}`;

        const attempt = async () =>
            client
                .post(url, formData, {
                    cancelToken: cancelRef.current?.token,
                    onUploadProgress: (evt) => {
                        if (!evt.total) return; // sometimes browser hides total
                        const pct = Math.round((evt.loaded / evt.total) * 100);
                        setUploadProgress(pct);
                    },
                    headers: {
                        // Let the browser set content-type boundary for FormData
                    },
                })
                .then((res) => res.data);

        // single retry with tiny backoff
        try {
            const data = await attempt();
            return data;
        } catch (err) {
            const ae = err as AxiosError;
            if (axios.isCancel(ae)) throw err; // aborted by user
            await new Promise((r) => setTimeout(r, 1200));
            const data = await attempt(); // retry once
            return data;
        } finally {
            setIsUploading(false);
            cancelRef.current = null;
        }
    };

    const abortUpload = () => {
        cancelRef.current?.cancel('Upload aborted by user');
        setIsUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            // if you need non-images too, loosen this up or mirror server rules
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
        maxSize: 5 * 1024 * 1024 * 1024, // 5GB per file (matches server)
        disabled: useExternalLink || isUploading,
        onDropAccepted: async (acceptedFiles) => {
            if (!acceptedFiles.length) return;
            try {
                const promise = doUpload(acceptedFiles);

                await toast.promise(promise, {
                    loading: 'Uploading files…',
                    success: (data) => {
                        // server returns: { folderPath, storedFiles }
                        setValue('downloadLink', data.folderPath);
                        setValue('images', data.storedFiles?.length || 0);
                        setUploadProgress(100);
                        return 'Files uploaded successfully!';
                    },
                    error: (err) => {
                        const msg =
                            err?.response?.data?.message ||
                            (err?.message?.includes('aborted')
                                ? 'Upload canceled'
                                : err?.message) ||
                            'Failed to upload files';
                        return msg;
                    },
                });
            } catch (error) {
                ApiError(error);
            } finally {
                setIsUploading(false);
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
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                {label}{' '}
                {required && <span className="text-destructive">*</span>}
            </label>

            {description && (
                <p className="text-sm text-muted-foreground mb-2">
                    {description}
                </p>
            )}

            <div className="flex gap-2 mb-2">
                <Button
                    type="button"
                    variant={!useExternalLink ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseExternalLink(false)}
                    disabled={isUploading}
                >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Upload Files
                </Button>
                <Button
                    type="button"
                    variant={useExternalLink ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseExternalLink(true)}
                    disabled={isUploading}
                >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Use External Link
                </Button>
            </div>

            {useExternalLink ? (
                <div className="space-y-1">
                    <Input
                        placeholder="Paste your Dropbox, Google Drive, or other file link"
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
                        disabled={isUploading}
                    />
                    {errors['downloadLink'] && (
                        <p className="text-sm text-destructive">
                            {(errors['downloadLink']?.message as string) || ''}
                        </p>
                    )}
                </div>
            ) : currentValue ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <FilePlus2 className="h-5 w-5" />
                    <span className="truncate flex-1" title={currentValue}>
                        {currentValue}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={isUploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors',
                        isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/30',
                        isUploading && 'opacity-50'
                    )}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <div className="w-full space-y-2">
                                <Progress
                                    value={uploadProgress}
                                    className="h-2"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{uploadProgress}% uploaded</span>
                                    <span>{uploadTime}s elapsed</span>
                                </div>
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={abortUpload}
                                    >
                                        <Square className="mr-2 h-4 w-4" />
                                        Cancel Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="h-8 w-8" />
                            <div>
                                <p className="font-medium">
                                    {isDragActive
                                        ? 'Drop files here'
                                        : 'Click or drag files here'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Images (JPEG, PNG, GIF, BMP, TIFF, WEBP) —
                                    up to 5GB per file
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

