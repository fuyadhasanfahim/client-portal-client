import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import {
    s3ForBucket,
    bucket,
    CreateMultipartUploadCommand,
} from '@/lib/aws/s3';
import { clientPrefix, adminPrefix, keyUnder } from '@/lib/aws/keys';
import OrderModel from '@/models/order.model';
import QuoteModel from '@/models/quote.model';
import { getNextRevision } from '@/lib/storage/record';

export async function POST(req: NextRequest) {
    const {
        refType,
        refId,
        as,
        files,
        revision: inputRevision,
    } = await req.json();

    if (
        !['order', 'quote'].includes(refType) ||
        !refId ||
        !['client', 'admin'].includes(as)
    ) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const doc =
        refType === 'order'
            ? await OrderModel.findOne({ orderID: refId })
            : await QuoteModel.findOne({ quoteID: refId });

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const userID = doc.user.userID;
    const batchId = nanoid();
    const s3 = await s3ForBucket();

    const revision =
        as === 'admin'
            ? typeof inputRevision === 'number'
                ? inputRevision
                : await getNextRevision(refType, refId)
            : undefined;

    const basePrefix =
        as === 'client'
            ? clientPrefix({ userID, refType, refId, batchId })
            : adminPrefix({ userID, refType, refId, revision: revision! });

    const objects = [];
    for (const f of files) {
        const key = keyUnder(basePrefix, f.filename);
        const cmd = new CreateMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            ContentType: f.contentType || 'application/octet-stream',
        });
        const res = await s3.send(cmd);
        objects.push({
            key,
            uploadId: res.UploadId,
            recommendedPartSize: Math.max(
                64 * 1024 * 1024,
                Math.ceil(f.size / 10000)
            ),
        });
    }

    return NextResponse.json({
        batchId,
        revision,
        basePrefix,
        objects,
    });
}
