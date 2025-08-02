'use client';

import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    FilePlus2,
    UploadCloud,
    X,
    Loader2,
    Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import ApiError from '@/components/shared/ApiError';

export default function FileUploadField({
    label,
    required = false,
    description = '',
    orderID,
    userID,
    quoteID,
}: {
    label: string;
    required?: boolean;
    description?: string;
    orderID?: string;
    userID: string;
    quoteID?: string;
}) {
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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isUploading) {
            const startTime = Date.now();
            intervalRef.current = setInterval(() => {
                setUploadTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setUploadTime(0);
            setUploadProgress(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isUploading]);

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
        disabled: useExternalLink,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            try {
                setIsUploading(true);
                setUploadProgress(0);

                const formData = new FormData();
                acceptedFiles.forEach((file) => formData.append('files', file));

                const uploadFn = async () => {
                    const isOrder = !!orderID;
                    const type = isOrder ? 'orders' : 'quotes';
                    const id = isOrder ? orderID : quoteID;

                    const fileUploadUrl = `${process.env
                        .NEXT_PUBLIC_SERVER_API!}/api/${type}/upload?userID=${userID}&${
                        isOrder ? 'orderID' : 'quoteID'
                    }=${id}`;

                    const response = await fetch(fileUploadUrl, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Upload failed');
                    }

                    const data = await response.json();

                    setValue('downloadLink', data.folderPath);
                    setValue('images', data.storedFiles?.length || 0);

                    return {
                        folderPath: data.folderPath,
                        files: data.storedFiles,
                        downloadUrl: data.folderPath,
                    };
                };

                const uploadPromise = uploadFn();

                const progressInterval = setInterval(() => {
                    setUploadProgress((prev) => {
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return prev;
                        }
                        return prev + 10;
                    });
                }, 500);

                await toast.promise(uploadPromise, {
                    loading: (
                        <div className="flex flex-col gap-2">
                            <span>Uploading files...</span>
                            <Progress value={uploadProgress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{uploadProgress}%</span>
                                <span>{uploadTime}s elapsed</span>
                            </div>
                        </div>
                    ),
                    success: () => {
                        setUploadProgress(100);
                        setUseExternalLink(false);
                        return 'Files uploaded successfully!';
                    },
                    error: (err) => {
                        clearInterval(progressInterval);
                        return err.message || 'Failed to upload files';
                    },
                });

                clearInterval(progressInterval);
                setUploadProgress(100);
            } catch (error) {
                ApiError(error);
            } finally {
                setIsUploading(false);
            }
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
                                    !value.match(
                                        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/
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
                            {errors['downloadLink']?.message as string}
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
                    className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/30'
                    } ${isUploading ? 'opacity-50' : ''}`}
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
                                    Images (JPEG, PNG, GIF, BMP, TIFF, WEBP)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
