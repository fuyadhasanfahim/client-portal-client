/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Loader2,
    UploadCloud,
    Link as LinkIcon,
    CheckCircle2,
    Copy,
    ExternalLink,
} from 'lucide-react';

type RefType = 'order' | 'quote';
type AsWho = 'client' | 'admin';

type InitObject = {
    key: string;
    uploadId: string;
    recommendedPartSize: number;
};
type InitResponse = {
    batchId: string;
    revision?: number;
    basePrefix: string;
    objects: InitObject[];
};
type SignPartResponse = { url: string };
type CompleteObject = {
    key: string;
    uploadId: string;
    parts: { PartNumber: number; ETag: string }[];
    size: number;
    filename: string;
    contentType?: string;
};

export interface FileUploadFieldProps {
    label?: string;
    description?: string;
    refType: RefType;
    refId: string;
    userID: string;
    as: AsWho;
    revision?: number;
    accept?: string[];
    multiple?: boolean;
    maxFileSizeMB?: number;
    required?: boolean;
    defaultLink?: string;
    onCompleted?: (link: string) => void;
    lockAfterSuccess?: boolean;
    onImagesCount?: (count: number) => void;
}

type Mode = 'upload' | 'link';

export default function FileUploadField(props: FileUploadFieldProps) {
    const {
        label = 'Files',
        description = 'Upload files or provide a link',
        refType,
        refId,
        userID,
        as,
        revision: revisionProp,
        accept,
        multiple = true,
        maxFileSizeMB,
        required,
        defaultLink,
        onCompleted,
        lockAfterSuccess = true,
        onImagesCount,
    } = props;

    const [mode, setMode] = useState<Mode>('upload');
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentLink, setCurrentLink] = useState<string | undefined>(
        defaultLink
    );
    const [linkInput, setLinkInput] = useState<string>('');

    const totalBytesRef = useRef<number>(0);
    const uploadedBytesRef = useRef<number>(0);

    const acceptMap = useMemo(() => {
        if (!accept?.length) return undefined;
        const map: Record<string, string[]> = {};
        for (const a of accept) map[a] = [];
        return map;
    }, [accept]);

    const isLocked = lockAfterSuccess && !!currentLink;
    const linkKind = as === 'admin' ? 'Delivery link' : 'Download link';

    const bytesToSize = (n: number) => {
        if (n < 1024) return `${n} B`;
        const kb = n / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(1)} MB`;
        return `${(mb / 1024).toFixed(1)} GB`;
    };

    const isImageName = (name: string) =>
        /\.(jpe?g|png|gif|bmp|tiff?|webp|svg)$/i.test(name);

    const computeParts = (file: File, partSize: number) => {
        const parts: { start: number; end: number; PartNumber: number }[] = [];
        let partNumber = 1;
        for (let start = 0; start < file.size; start += partSize) {
            const end = Math.min(start + partSize, file.size);
            parts.push({ start, end, PartNumber: partNumber++ });
        }
        return parts;
    };

    const updateProgress = (deltaBytes: number, total: number) => {
        uploadedBytesRef.current += deltaBytes;
        const pct = Math.floor((uploadedBytesRef.current / total) * 100);
        setProgress(pct);
    };

    const startUpload = useCallback(
        async (selected: File[]) => {
            if (!selected.length) return;
            if (maxFileSizeMB) {
                const tooBig = selected.find(
                    (f) => f.size > maxFileSizeMB * 1024 * 1024
                );
                if (tooBig) {
                    toast.error(`"${tooBig.name}" exceeds ${maxFileSizeMB} MB`);
                    return;
                }
            }

            // NEW: detect image count from the selection and bubble it up
            const imgCount = selected.filter(
                (f) => f.type?.startsWith('image/') || isImageName(f.name)
            ).length;
            if (onImagesCount) onImagesCount(imgCount);

            try {
                setBusy(true);
                setProgress(0);
                uploadedBytesRef.current = 0;
                totalBytesRef.current = selected.reduce(
                    (a, f) => a + f.size,
                    0
                );

                // Let the server decide the revision when admin (unless provided)
                let revision =
                    as === 'admin' ? revisionProp ?? undefined : undefined;

                // 1) INIT
                const initRes = await fetch('/api/storage/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        refType,
                        refId,
                        as,
                        files: selected.map((f) => ({
                            filename: f.name,
                            size: f.size,
                            contentType: f.type || 'application/octet-stream',
                        })),
                        ...(revision !== undefined ? { revision } : {}),
                    }),
                });
                if (!initRes.ok) throw new Error('Failed to initialize upload');
                const initData: InitResponse = await initRes.json();

                if (as === 'admin') {
                    revision = initData.revision ?? revision ?? 1;
                }

                // 2) Upload parts
                const completeObjects: CompleteObject[] = [];
                for (let i = 0; i < selected.length; i++) {
                    const file = selected[i];
                    const obj = initData.objects[i];
                    const partSize = Math.max(
                        obj.recommendedPartSize || 64 * 1024 * 1024,
                        5 * 1024 * 1024
                    );
                    const parts = computeParts(file, partSize);

                    const uploadedParts: {
                        PartNumber: number;
                        ETag: string;
                    }[] = [];
                    const concurrency = 4;
                    let idx = 0;

                    async function uploadOne(p: {
                        start: number;
                        end: number;
                        PartNumber: number;
                    }) {
                        const signUrl = new URL(
                            '/api/storage/sign-part',
                            window.location.origin
                        );
                        signUrl.searchParams.set('key', obj.key);
                        signUrl.searchParams.set('uploadId', obj.uploadId);
                        signUrl.searchParams.set(
                            'partNumber',
                            String(p.PartNumber)
                        );
                        const signRes = await fetch(signUrl.toString(), {
                            method: 'GET',
                        });
                        if (!signRes.ok)
                            throw new Error('Failed to sign part URL');
                        const { url }: SignPartResponse = await signRes.json();

                        const chunk = file.slice(p.start, p.end);
                        const putRes = await fetch(url, {
                            method: 'PUT',
                            body: chunk,
                        });
                        if (!putRes.ok)
                            throw new Error(
                                `Part ${p.PartNumber} upload failed`
                            );

                        const etag = (
                            putRes.headers.get('ETag') ||
                            putRes.headers.get('Etag') ||
                            ''
                        ).replace(/"/g, '');
                        if (!etag) throw new Error('Missing ETag from S3');

                        uploadedParts.push({
                            PartNumber: p.PartNumber,
                            ETag: etag,
                        });
                        updateProgress(chunk.size, totalBytesRef.current);
                    }

                    const runPool = async () => {
                        const workers: Promise<void>[] = [];
                        for (
                            let w = 0;
                            w < concurrency && idx < parts.length;
                            w++
                        ) {
                            const p = parts[idx++];
                            workers.push(uploadOne(p));
                        }
                        await Promise.all(workers);
                        if (idx < parts.length) await runPool();
                    };
                    await runPool();

                    uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);

                    completeObjects.push({
                        key: obj.key,
                        uploadId: obj.uploadId,
                        parts: uploadedParts,
                        size: file.size,
                        filename: file.name,
                        contentType: file.type || 'application/octet-stream',
                    });
                }

                // 3) COMPLETE
                const completeRes = await fetch('/api/storage/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        refType,
                        refId,
                        as,
                        userID,
                        batchId: initData.batchId,
                        revision,
                        s3Prefix: initData.basePrefix,
                        objects: completeObjects,
                    }),
                });
                if (!completeRes.ok)
                    throw new Error('Failed to complete upload');
                const data = await completeRes.json();

                setCurrentLink(data.link);
                toast.success('Files uploaded and link set!');
                onCompleted?.(data.link);
                setProgress(100);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message || 'Upload failed');
            } finally {
                setBusy(false);
            }
        },
        [
            accept,
            as,
            maxFileSizeMB,
            onCompleted,
            onImagesCount,
            refId,
            refType,
            revisionProp,
            userID,
        ]
    );

    // Auto-start upload on drop/selection
    const onDrop = useCallback(
        (accepted: File[]) => {
            if (!accepted.length) return;
            void startUpload(accepted);
        },
        [startUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept: acceptMap,
        disabled: busy || isLocked, // prevent selecting more when locked
    });

    const handleSaveLink = async () => {
        const url = linkInput.trim();
        if (!url) {
            toast.error('Please paste a link.');
            return;
        }
        try {
            new URL(url);
        } catch {
            toast.error('Invalid URL');
            return;
        }
        try {
            setBusy(true);
            const res = await fetch('/api/storage/set-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refType, refId, as, url }),
            });
            if (!res.ok) throw new Error('Failed to save link');
            setCurrentLink(url);
            toast.success('Link saved!');
            onCompleted?.(url);
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save link');
        } finally {
            setBusy(false);
        }
    };

    if (isLocked) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-0.5">*</span>
                        )}
                    </label>
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">
                        {linkKind}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground">
                    The {linkKind.toLowerCase()} has been saved. Uploading is
                    disabled for this item.
                </p>

                {currentLink && (
                    <div className="flex items-center justify-between rounded border p-2">
                        <div className="text-xs break-all flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">{linkKind}:</span>
                            <a
                                className="underline"
                                href={currentLink}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {currentLink}
                            </a>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard
                                        .writeText(currentLink!)
                                        .then(
                                            () => toast.success('Link copied'),
                                            () => toast.error('Failed to copy')
                                        );
                                }}
                                title="Copy link"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                                asChild
                                variant="secondary"
                                size="sm"
                                title="Open link"
                            >
                                <a
                                    href={currentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="flex items-center gap-2 text-xs">
                    <button
                        type="button"
                        className={`px-2 py-1 rounded ${
                            mode === 'upload'
                                ? 'bg-foreground text-background'
                                : 'bg-muted'
                        }`}
                        onClick={() => setMode('upload')}
                        disabled={busy}
                    >
                        Upload
                    </button>
                    <button
                        type="button"
                        className={`px-2 py-1 rounded ${
                            mode === 'link'
                                ? 'bg-foreground text-background'
                                : 'bg-muted'
                        }`}
                        onClick={() => setMode('link')}
                        disabled={busy}
                    >
                        Use link
                    </button>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">{description}</p>

            {mode === 'upload' ? (
                <div className="space-y-3">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer focus:outline-none ${
                            busy
                                ? 'opacity-60 cursor-not-allowed'
                                : isDragActive
                                ? 'border-primary'
                                : 'border-muted-foreground/25'
                        }`}
                        title={busy ? 'Uploading in progress' : undefined}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <UploadCloud className="w-6 h-6" />
                            <div className="text-sm">
                                {busy
                                    ? 'Uploading…'
                                    : isDragActive
                                    ? 'Drop files here…'
                                    : 'Drag & drop files here, or click to select'}
                            </div>
                            {maxFileSizeMB ? (
                                <div className="text-[11px] text-muted-foreground">
                                    Max per file: {maxFileSizeMB} MB
                                </div>
                            ) : null}
                            {accept?.length ? (
                                <div className="text-[11px] text-muted-foreground">
                                    Accepted: {accept.join(', ')}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {busy && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Uploading… {progress}% (
                                {bytesToSize(uploadedBytesRef.current)} /{' '}
                                {bytesToSize(totalBytesRef.current)})
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="https://drive.google.com/… or S3/CloudFront URL"
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            disabled={busy}
                        />
                        <Button
                            type="button"
                            onClick={handleSaveLink}
                            disabled={busy}
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Save link
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
