import DraftOrderModel from '@/models/draft-order.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Draft ID is required.',
                },
                { status: 400 }
            );
        }

        const draftData = await DraftOrderModel.findById(id);

        return NextResponse.json(
            {
                success: true,
                message: 'Draft order fetched successfully.',
                data: draftData,
            },
            {
                status: 200,
            }
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
