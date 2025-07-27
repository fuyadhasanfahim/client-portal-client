'use client';

import { CardDescription } from '@/components/ui/card';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Upload, FileArchive } from 'lucide-react';
import toast from 'react-hot-toast';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useRef, useState } from 'react';
import JSZip from 'jszip';

export default function FileUploadField({
    label,
    name,
    control,
    setValue,
    required = false,
    description = '',
    orderID,
    isDownloadLink = true,
}: {
    label: string;
    name: 'downloadLink' | 'sourceFileLink';
    control: any;
    setValue: any;
    required?: boolean;
    description?: string;
    orderID: string;
    isDownloadLink?: boolean;
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useLoggedInUser();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const zip = new JSZip();
            let currentZipSize = 0;
            let zipIndex = 1;
            let currentZip = zip.folder(`images_part_${zipIndex}`) || zip;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Check if adding this file would exceed 5GB (in bytes)
                if (currentZipSize + file.size > 5 * 1024 * 1024 * 1024) {
                    // Create a new zip file
                    zipIndex++;
                    currentZip = zip.folder(`images_part_${zipIndex}`) || zip;
                    currentZipSize = 0;
                }

                currentZip.file(file.name, file);
                currentZipSize += file.size;

                // Update progress
                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }

            const zipFiles: Blob[] = [];
            for (let i = 1; i <= zipIndex; i++) {
                const content = await zip
                    .folder(`images_part_${i}`)
                    ?.generateAsync({
                        type: 'blob',
                        compression: 'DEFLATE',
                        compressionOptions: { level: 6 },
                    });
                if (content) zipFiles.push(content);
            }

            // Upload each zip file
            const uploadPromises = zipFiles.map(async (zipBlob, index) => {
                const formData = new FormData();
                formData.append(
                    'files',
                    zipBlob,
                    `images_part_${index + 1}.zip`
                );

                const response = await fetch(
                    `https://win-b8is3pi01n4.tail64af45.ts.net/api/orders/upload-images?userID=${user.userID}&orderID=${orderID}&isDownloadLink=${isDownloadLink}`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to upload part ${index + 1}`);
                }

                return response.json();
            });

            const results = await Promise.all(uploadPromises);

            // Get the first URL as the main download link
            const downloadUrl = results[0]?.storedFiles?.[0]?.path || '';
            setValue(name, downloadUrl);

            toast.success(
                `Files uploaded successfully (${zipFiles.length} parts)`
            );
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('File upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {label}{' '}
                        {required && (
                            <span className="text-destructive">*</span>
                        )}
                    </FormLabel>
                    {description && (
                        <CardDescription className="mb-2">
                            {description}
                        </CardDescription>
                    )}
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Input
                                type="url"
                                placeholder="Enter URL or upload files"
                                {...field}
                                className="flex-1"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                            <FileArchive className="mr-2 h-4 w-4" />
                            <span className="truncate">{field.value}</span>
                        </div>
                    )}
                </FormItem>
            )}
        />
    );
}
