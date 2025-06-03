import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderID, data } = body;

        if (!orderID || !data) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid request. Order ID and data are required.',
                },
                {
                    status: 400,
                }
            );
        }

        await dbConfig();

        await OrderModel.findOneAndUpdate({ orderID }, data);

        return NextResponse.json(
            {
                success: true,
                message: 'Order updated successfully.',
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
