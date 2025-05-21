import dbConfig from '@/lib/dbConfig';
import DraftOrderModel from '@/models/draft-order.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { searchParams } = new URL(req.nextUrl);
        const userId = searchParams.get('user-id');

        if (!body) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No data provided.',
                },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User ID is required.',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        const draftOrder = await DraftOrderModel.create({
            ...body,
            userId,
        });

        const draftOrderId = draftOrder._id.toString();

        return NextResponse.json(
            {
                success: true,
                message: 'Draft order created successfully.',
                draftOrderId,
            },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
