import { NextRequest, NextResponse } from 'next/server';
import {
    s3ForBucket,
    bucket,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
} from '@/lib/aws/s3';

export async function POST(req: NextRequest) {
    const { uploadId, objectKey, parts } = await req.json();

    if (!uploadId || !objectKey || !Array.isArray(parts) || !parts.length) {
        return NextResponse.json(
            { message: 'Missing completion data' },
            { status: 400 }
        );
    }

    const s3 = await s3ForBucket();

    try {
        const res = await s3.send(
            new CompleteMultipartUploadCommand({
                Bucket: bucket,
                Key: objectKey,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.sort(
                        (a: any, b: any) => a.PartNumber - b.PartNumber
                    ),
                },
            })
        );

        return NextResponse.json({
            ok: true,
            location: res.Location,
            bucket: res.Bucket,
            key: res.Key,
        });
    } catch (e: any) {
        try {
            await s3.send(
                new AbortMultipartUploadCommand({
                    Bucket: bucket,
                    Key: objectKey,
                    UploadId: uploadId,
                })
            );
        } catch {}
        return NextResponse.json(
            { message: e?.message || 'complete failed' },
            { status: 500 }
        );
    }
}
