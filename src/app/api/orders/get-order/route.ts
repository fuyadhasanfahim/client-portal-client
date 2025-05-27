import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('id');
        const orderStatus = req.nextUrl.searchParams.get('order-status');

        await dbConfig();

        const order = await OrderModel.findOne({
            _id: id,
            orderStatus,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Draft order retrieved successfully.',
                data: order,
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
