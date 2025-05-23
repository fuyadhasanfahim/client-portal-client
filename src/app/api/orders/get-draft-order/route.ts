import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');

        await dbConfig();

        const draftOrder = await OrderModel.findOne({
            _id: id,
            status: 'awaiting-details',
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Draft order retrieved successfully.',
                data: draftOrder,
            },
            { status: 200 }
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
