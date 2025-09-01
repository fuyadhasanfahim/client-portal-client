/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
    UploadCloud,
    Link as LinkIcon,
    CheckCircle2,
    ExternalLink,
    Link,
    Loader2,
} from 'lucide-react';

type RefType = 'order' | 'quote';
type AsWho = 'user' | 'admin';

type InitObject =
    | {
          key: string;
          mode: 'single';
          putUrl: string;
          contentType?: string;
      }
    | {
          key: string;
          mode: 'mpu';
          uploadId: string;
          recommendedPartSize: number;
          contentType?: string;
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

type SingleRecordedObject = {
    key: string;
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
    accept?: string[]; // if omitted, defaults to "all images"
    multiple?: boolean;
    maxFileSizeMB?: number;
    required?: boolean;
    defaultLink?: string;
    onCompleted?: (link: string) => void;
    lockAfterSuccess?: boolean;
    onImagesCount?: (count: number) => void;
}

type Mode = 'upload' | 'link';

// Broad set of image + camera RAW extensions
const RAW_IMAGE_EXTS = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'tif',
    'tiff',
    'webp',
    'svg',
    'heic',
    'heif',
    'avif',
    'raw',
    'cr2',
    'cr3',
    'nef',
    'nrw',
    'arw',
    'dng',
    'raf',
    'rw2',
    'orf',
    'srw',
    'pef',
    'x3f',
    'k25',
    'kdc',
    'erf',
    'mos',
    'mef',
    'mrw',
    'sr2',
    'srf',
    'rwl',
    'iiq',
    '3fr',
];
const IMG_RE = new RegExp(`\\.(${RAW_IMAGE_EXTS.join('|')})$`, 'i');

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
    const abortersRef = useRef<Set<AbortController>>(new Set());

    // Accept: if `accept` not provided, default to ALL images (plus RAW extensions)
    const acceptMap = useMemo(() => {
        // If user passes an explicit list, honor it
        if (accept && accept.length) {
            const map: Record<string, string[]> = {};
            for (const a of accept) map[a] = [];
            return map;
        }
        // Default: allow ALL images including RAW (some browsers label RAW as octet-stream but ext will pass)
        return {
            'image/*': RAW_IMAGE_EXTS.map((ext) => `.${ext}`),
        } as Record<string, string[]>;
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

    const isImageName = (name: string) => IMG_RE.test(name);

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
        setProgress(Math.min(100, Math.max(0, pct)));
    };

    useEffect(() => {
        // capture the current Set reference when the effect runs
        const controllers = abortersRef.current;

        return () => {
            controllers.forEach((ac) => ac.abort());
            controllers.clear();
        };
    }, []);

    const putWithRetry = async (
        url: string,
        body: Blob | File,
        attempts = 3
    ) => {
        let last: any;
        for (let i = 0; i < attempts; i++) {
            const ac = new AbortController();
            abortersRef.current.add(ac);
            try {
                const res = await fetch(url, {
                    method: 'PUT',
                    body,
                    signal: ac.signal,
                });
                if (!res.ok) throw new Error(`PUT ${res.status}`);
                return res;
            } catch (e) {
                last = e;
                if (i < attempts - 1)
                    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
            } finally {
                abortersRef.current.delete(ac);
            }
        }
        throw last;
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

            // Bubble up image count if needed
            const imgCount = selected.filter(
                (f) => f.type?.startsWith('image/') || isImageName(f.name)
            ).length;
            onImagesCount?.(imgCount);

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

                // 1) INIT (mixed-mode: some single, some MPU)
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

                // Helper to upload ONE file, handles both modes
                const uploadSingleFile = async (
                    file: File,
                    obj: InitObject
                ) => {
                    if (obj.mode === 'single') {
                        // single-part PUT (no MPU)
                        const res = await putWithRetry(obj.putUrl, file);
                        if (!res.ok) throw new Error(`PUT ${res.status}`);
                        updateProgress(file.size, totalBytesRef.current);
                        return {
                            kind: 'single' as const,
                            key: obj.key,
                            size: file.size,
                            filename: file.name,
                            contentType:
                                file.type ||
                                obj.contentType ||
                                'application/octet-stream',
                        };
                    }

                    // MPU path
                    const partSize = Math.max(
                        obj.recommendedPartSize ?? 5 * 1024 * 1024,
                        5 * 1024 * 1024
                    );
                    const parts = computeParts(file, partSize);
                    const uploadedParts: {
                        PartNumber: number;
                        ETag: string;
                    }[] = [];
                    const concurrency = Math.min(
                        8,
                        (navigator as any)?.hardwareConcurrency ?? 8
                    );

                    const signUrl = async (partNumber: number) => {
                        const u = new URL(
                            '/api/storage/sign-part',
                            window.location.origin
                        );
                        u.searchParams.set('key', obj.key);
                        u.searchParams.set('uploadId', obj.uploadId);
                        u.searchParams.set('partNumber', String(partNumber));
                        const signRes = await fetch(u.toString(), {
                            method: 'GET',
                        });
                        if (!signRes.ok)
                            throw new Error('Failed to sign part URL');
                        const { url }: SignPartResponse = await signRes.json();
                        return url;
                    };

                    const uploadOne = async (p: {
                        start: number;
                        end: number;
                        PartNumber: number;
                    }) => {
                        const url = await signUrl(p.PartNumber);
                        const chunk = file.slice(p.start, p.end);
                        const putRes = await putWithRetry(url, chunk);
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
                    };

                    // Steady promise pool to keep connections saturated
                    let idx = 0;
                    const inFlight = new Set<Promise<void>>();
                    const startOne = () => {
                        if (idx >= parts.length) return;
                        const next = uploadOne(parts[idx++])
                            .catch((e) => {
                                throw e;
                            })
                            .finally(() => inFlight.delete(next));
                        inFlight.add(next);
                    };
                    while (inFlight.size < concurrency && idx < parts.length)
                        startOne();
                    while (inFlight.size) {
                        await Promise.race(inFlight);
                        while (
                            inFlight.size < concurrency &&
                            idx < parts.length
                        )
                            startOne();
                    }

                    uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
                    return {
                        kind: 'mpu' as const,
                        key: obj.key,
                        uploadId: obj.uploadId,
                        parts: uploadedParts,
                        size: file.size,
                        filename: file.name,
                        contentType:
                            file.type ||
                            obj.contentType ||
                            'application/octet-stream',
                    };
                };

                // 2) Upload — bump file-level concurrency if most are small
                const smallCount = initData.objects.filter(
                    (o) => o.mode === 'single'
                ).length;
                const manySmall = smallCount > initData.objects.length * 0.6;
                const FILE_CONCURRENCY = manySmall
                    ? Math.min(6, selected.length)
                    : Math.min(2, selected.length);

                const completeObjects: CompleteObject[] = []; // for MPU /complete
                const singleRecorded: SingleRecordedObject[] = []; // for recording singles on server

                const tasks = selected.map((file, i) => async () => {
                    const obj = initData.objects[i] as InitObject;
                    try {
                        const result = await uploadSingleFile(file, obj);
                        if (result.kind === 'mpu') {
                            completeObjects.push({
                                key: result.key,
                                uploadId: (result as any).uploadId,
                                parts: (result as any).parts,
                                size: result.size,
                                filename: result.filename,
                                contentType: result.contentType,
                            });
                        } else {
                            singleRecorded.push({
                                key: result.key,
                                size: result.size,
                                filename: result.filename,
                                contentType: result.contentType,
                            });
                        }
                    } catch (err) {
                        // Best-effort abort for MPUs only
                        if (obj.mode === 'mpu') {
                            try {
                                await fetch('/api/storage/abort', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        key: obj.key,
                                        uploadId: (obj as any).uploadId,
                                    }),
                                });
                            } catch {}
                        }
                        throw err;
                    }
                });

                // Simple scheduler for file-level concurrency
                let cursor = 0;
                const runners: Promise<void>[] = [];
                const runNext = async () => {
                    if (cursor >= tasks.length) return;
                    const t = tasks[cursor++]!;
                    await t();
                    return runNext();
                };
                for (let i = 0; i < FILE_CONCURRENCY; i++)
                    runners.push(runNext());
                await Promise.all(runners);

                // 3) COMPLETE / RECORD
                // - Call /complete for MPU files (server finalizes & records)
                // - Then record singles so links appear in UI (with 404 fallback)
                let linkFromComplete: string | undefined;

                if (completeObjects.length) {
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
                    linkFromComplete = data.link as string | undefined;
                }

                if (singleRecorded.length) {
                    const res = await fetch('/api/storage/record-singles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            refType,
                            refId,
                            as,
                            userID,
                            batchId: initData.batchId,
                            s3Prefix: initData.basePrefix,
                            files: singleRecorded,
                            revision, // include for admin deliveries
                        }),
                    });

                    if (res.ok) {
                        if (!linkFromComplete) {
                            const data = await res.json();
                            linkFromComplete = data.link;
                        }
                    } else if (res.status === 404) {
                        // Fallback: synthesize link + persist so UI has something to show
                        const fallbackLink =
                            as === 'user'
                                ? `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=user&batchId=${initData.batchId}`
                                : `/api/storage/download?refType=${refType}&refId=${refId}&uploadedBy=admin&revision=${revision}`;
                        await fetch('/api/storage/set-link', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                refType,
                                refId,
                                as,
                                url: fallbackLink,
                            }),
                        });
                        if (!linkFromComplete) linkFromComplete = fallbackLink;
                    } else {
                        console.warn(
                            'record-singles failed:',
                            res.status,
                            res.statusText
                        );
                    }
                }

                if (linkFromComplete) {
                    setCurrentLink(linkFromComplete);
                    toast.success('Files uploaded and link set!');
                    onCompleted?.(linkFromComplete);
                } else {
                    toast.success('Files uploaded!');
                }

                setProgress(100);
            } catch (err: any) {
                console.error(err);
                toast.error(err?.message || 'Upload failed');
            } finally {
                setBusy(false);
            }
        },
        [
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
        disabled: busy || isLocked,
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

    // === Locked state ===
    if (isLocked) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-0.5">*</span>
                        )}
                    </Label>
                    <span className="text-[11px] rounded-full bg-muted px-2 py-0.5">
                        {linkKind}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground">
                    The {linkKind.toLowerCase()} has been saved. Uploading is
                    disabled for this item.
                </p>

                {currentLink && (
                    // Single link row (no duplicate "Saved link" line)
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
                )}
            </div>
        );
    }

    // === Normal state ===
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <div className="flex items-center gap-2 text-xs">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => setMode('upload')}
                        disabled={busy}
                    >
                        <UploadCloud className="mr-1 h-4 w-4" />
                        Upload
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setMode('link')}
                        disabled={busy}
                    >
                        <Link className="mr-1 h-4 w-4" />
                        Use link
                    </Button>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                {description}{' '}
                {(!accept || accept.length === 0) &&
                    '(All image formats supported)'}
            </p>

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
                            {/* If accept was passed explicitly, show it; otherwise note "All images" */}
                            {accept && accept.length ? (
                                <div className="text-[11px] text-muted-foreground">
                                    Accepted: {accept.join(', ')}
                                </div>
                            ) : (
                                <div className="text-[11px] text-muted-foreground">
                                    Accepted: image/* (+ RAW like .heic, .cr3,
                                    .nef, .arw, .dng, …)
                                </div>
                            )}
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
