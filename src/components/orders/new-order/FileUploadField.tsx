import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
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
import ApiError from '@/components/shared/ApiError';

export default function FileUploadField({
    label,
    name,
    required = false,
    description = '',
    orderID,
    userID,
    isDownloadLink = true,
}: {
    label: string;
    name: 'downloadLink' | 'sourceFileLink';
    required?: boolean;
    description?: string;
    orderID: string;
    userID: string;
    isDownloadLink?: boolean;
}) {
    const {
        setValue,
        watch,
        register,
        formState: { errors },
    } = useFormContext();
    const [isUploading, setIsUploading] = useState(false);
    const [useExternalLink, setUseExternalLink] = useState(false);
    const currentValue = watch(name);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: isDownloadLink
            ? {
                  'image/*': [
                      '.jpeg',
                      '.jpg',
                      '.png',
                      '.gif',
                      '.bmp',
                      '.tiff',
                      '.webp',
                  ],
              }
            : undefined,
        multiple: isDownloadLink,
        maxSize: 5 * 1024 * 1024 * 1024,
        disabled: useExternalLink,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            try {
                setIsUploading(true);

                const formData = new FormData();
                acceptedFiles.forEach((file) =>
                    formData.append(isDownloadLink ? 'files' : 'file', file)
                );

                const uploadFn = async () => {
                    const endpoint = isDownloadLink
                        ? 'upload-images'
                        : 'upload-source-file';

                    const response = await fetch(
                        `https://desktop-dhsfq6p.tailc51032.ts.net/api/orders/${endpoint}?userID=${userID}&orderID=${orderID}`,
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Upload failed');
                    }

                    const data = await response.json();

                    // For image uploads, we get the folder path and files
                    if (isDownloadLink) {
                        setValue(name, data.folderPath);
                        setValue('images', data.storedFiles?.length || 0);
                        return {
                            folderPath: data.folderPath,
                            files: data.storedFiles,
                        };
                    }
                    // For source files, we get the file details
                    else {
                        setValue(name, data.storedFile?.path);
                        return {
                            file: data.storedFile,
                        };
                    }
                };

                await toast.promise(uploadFn(), {
                    loading: 'Uploading files...',
                    success: () => {
                        setUseExternalLink(false);
                        return 'Files uploaded successfully!';
                    },
                    error: (err) => err.message || 'Failed to upload files',
                });
            } catch (error) {
                ApiError(error);
            } finally {
                setIsUploading(false);
            }
        },
    });

    const handleRemove = () => {
        setValue(name, '');
        if (isDownloadLink) {
            setValue('images', 0);
        }
        setUseExternalLink(false);
    };

    const displayValue = currentValue?.split('/').pop() || currentValue;

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
                        {...register(name, {
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
                    {errors[name] && (
                        <p className="text-sm text-destructive">
                            {errors[name]?.message as string}
                        </p>
                    )}
                </div>
            ) : currentValue ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <FilePlus2 className="h-5 w-5" />
                    <span className="truncate flex-1" title={currentValue}>
                        {displayValue}
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
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span>Uploading...</span>
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
                                    {isDownloadLink
                                        ? 'Images (JPEG, PNG, GIF, BMP, TIFF, WEBP)'
                                        : 'Source files'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
