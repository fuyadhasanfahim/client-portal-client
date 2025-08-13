import { NextRequest, NextResponse } from 'next/server';
import { s3ForBucket, bucket } from '@/lib/aws/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');
        const name =
            searchParams.get('name') || key?.split('/').pop() || 'download';
        const expires = Math.min(
            Math.max(Number(searchParams.get('exp') || 300), 60),
            86400
        );

        if (!key) return new NextResponse('Missing ?key', { status: 400 });

        const s3 = await s3ForBucket();
        const url = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                ResponseContentDisposition: `attachment; filename="${name}"`,
            }),
            { expiresIn: expires }
        );

        return NextResponse.redirect(url);
    } catch (e: any) {
        return NextResponse.json(
            { message: e?.message || 'initiate failed' },
            { status: 500 }
        );
    }
}
