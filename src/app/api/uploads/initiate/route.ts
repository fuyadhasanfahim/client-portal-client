/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
    s3ForBucket,
    bucket,
    basePrefix,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    getSignedUrl,
    bucketBaseUrl,
} from '@/lib/aws/s3';
import { slugify, ymd, hms } from '@/lib/strings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            fileName,
            fileType,
            fileSize,
            userID,
            kind,
            id,
            mode,
            orderID,
            title,
            uploader,
        } = body;

        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json(
                { message: 'Missing fields' },
                { status: 400 }
            );
        }

        const s3 = await s3ForBucket();

        const today = ymd();
        const titleOrTime = title?.trim() ? slugify(title) : hms();
        let keyBase: string;
        let folderPath: string;

        if (mode === 'delivery') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json(
                    { message: 'Forbidden' },
                    { status: 403 }
                );
            }

            if (!orderID) {
                return NextResponse.json(
                    { message: 'orderID required for delivery mode' },
                    { status: 400 }
                );
            }
            folderPath = `${basePrefix}/deliveries/${orderID}/${today}/${titleOrTime}/`;
            keyBase = folderPath + crypto.randomUUID();
        } else {
            const effectiveKind = kind ?? (id ? 'orders' : 'quotes');
            const effectiveId = id;
            if (!userID || !effectiveKind || !effectiveId) {
                return NextResponse.json(
                    { message: 'Missing userID/kind/id' },
                    { status: 400 }
                );
            }
            folderPath = `${basePrefix}/${effectiveKind}/${userID}/${effectiveId}/`;
            keyBase = `${folderPath}${crypto.randomUUID()}`;
        }

        const objectKey = `${keyBase}/${fileName}`;

        const createRes = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: bucket,
                Key: objectKey,
                ContentType: fileType,
                Metadata: {
                    ...(orderID ? { orderid: orderID } : {}),
                    ...(uploader ? { uploader } : {}),
                },
            })
        );

        const uploadId = createRes.UploadId!;
        const partSize = 10 * 1024 * 1024;
        const partCount = Math.ceil(fileSize / partSize);

        const parts = await Promise.all(
            Array.from({ length: partCount }, async (_, idx) => {
                const PartNumber = idx + 1;
                const url = await getSignedUrl(
                    s3,
                    new UploadPartCommand({
                        Bucket: bucket,
                        Key: objectKey,
                        UploadId: uploadId,
                        PartNumber,
                    }),
                    { expiresIn: 60 * 10 }
                );
                return { partNumber: PartNumber, url };
            })
        );

        const baseUrl = await bucketBaseUrl();

        return NextResponse.json({
            uploadId,
            objectKey,
            parts,
            partSize,
            publicUrl: `${baseUrl}/${objectKey}`,
            folderPath,
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: e?.message || 'initiate failed' },
            { status: 500 }
        );
    }
}
