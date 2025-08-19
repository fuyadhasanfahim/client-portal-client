/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { s3ForBucket, bucket } from '@/lib/aws/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: NextRequest) {
    try {
        const { key, fileName, expiresIn = 300 } = await req.json();
        if (!key)
            return NextResponse.json(
                { message: 'key required' },
                { status: 400 }
            );

        const s3 = await s3ForBucket();
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${
                    fileName || key.split('/').pop() || 'download'
                }"`,
            }),
            { expiresIn: Math.min(Math.max(Number(expiresIn), 60), 86400) }
        );

        return NextResponse.json({ url });
    } catch (e: any) {
        return NextResponse.json(
            { message: e?.message || 'failed to presign' },
            { status: 500 }
        );
    }
}
