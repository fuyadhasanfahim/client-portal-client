import dbConfig from '@/lib/dbConfig';
import RevisionModel from '@/models/revision.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const orderID = searchParams.get('order_id');

        if (!orderID) {
            return NextResponse.json(
                { success: false, message: 'Missing order_id parameter.' },
                { status: 400 }
            );
        }

        await dbConfig();

        const revision = await RevisionModel.findOne({ orderID });

        if (!revision) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No revision found for this order.',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: revision,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
