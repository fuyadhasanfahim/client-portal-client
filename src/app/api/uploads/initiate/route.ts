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

export async function POST(req: NextRequest) {
    try {
        const { fileName, fileType, fileSize, userID, kind, id } =
            await req.json();

        if (!fileName || !fileType || !fileSize || !userID || !kind || !id) {
            return NextResponse.json(
                { message: 'Missing fields' },
                { status: 400 }
            );
        }

        const s3 = await s3ForBucket();

        // folder: {prefix}/{orders|quotes}/{userID}/{id}/{uuid}/file
        const keyBase = `${basePrefix}/${kind}/${userID}/${id}/${crypto.randomUUID()}`;
        const objectKey = `${keyBase}/${fileName}`;

        const createRes = await s3.send(
            new CreateMultipartUploadCommand({
                Bucket: bucket,
                Key: objectKey,
                ContentType: fileType,
            })
        );

        const uploadId = createRes.UploadId!;
        const partSize = 10 * 1024 * 1024; // 10MB chunks
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
                    { expiresIn: 60 * 10 } // 10 minutes
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
            folderPath: `${basePrefix}/${kind}/${userID}/${id}/`,
        });
    } catch (e: any) {
        return NextResponse.json(
            { message: e?.message || 'initiate failed' },
            { status: 500 }
        );
    }
}
