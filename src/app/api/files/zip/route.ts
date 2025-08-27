import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3ForBucket, bucket } from '@/lib/aws/s3';
import archiver from 'archiver';
import { Readable } from 'node:stream';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const prefix = url.searchParams.get('prefix');
    const name = url.searchParams.get('name') || 'delivery.zip';

    if (!prefix) {
        return NextResponse.json(
            { message: 'Missing ?prefix' },
            { status: 400 }
        );
    }

    const s3 = await s3ForBucket();

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('warning', (err) => console.warn('zip warning:', err));
    archive.on('error', (err) => {
        throw err;
    });

    // Convert Node stream -> Web ReadableStream for NextResponse
    const webStream = Readable.toWeb(archive as unknown as Readable);

    // Spawn the response immediately (streaming)
    const res = new NextResponse(webStream as unknown as BodyInit, {
        status: 200,
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${name}"`,
            'Cache-Control': 'private, max-age=0, no-store',
        },
    });

    (async () => {
        try {
            let ContinuationToken: string | undefined = undefined;
            do {
                const list: import('@aws-sdk/client-s3').ListObjectsV2CommandOutput =
                    await s3.send(
                        new ListObjectsV2Command({
                            Bucket: bucket,
                            Prefix: prefix.endsWith('/')
                                ? prefix
                                : `${prefix}/`,
                            ContinuationToken,
                        })
                    );

                const contents = list.Contents || [];
                for (const obj of contents) {
                    const Key = obj.Key!;
                    if (Key.endsWith('/')) continue;
                    const shortName = Key.substring(prefix.length).replace(
                        /^\/+/,
                        ''
                    );
                    const get = await s3.send(
                        new GetObjectCommand({ Bucket: bucket, Key })
                    );
                    const body = get.Body as Readable;
                    archive.append(body, { name: shortName || 'file' });
                }

                ContinuationToken = list.IsTruncated
                    ? list.NextContinuationToken
                    : undefined;
            } while (ContinuationToken);

            await archive.finalize();
        } catch (err) {
            try {
                archive.destroy(err as Error);
            } catch {}
            console.error('zip error:', err);
        }
    })();

    return res;
}
