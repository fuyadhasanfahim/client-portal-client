import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import Payment from '@/models/payment.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const {
            userID,
            orderID,
            paymentOption,
            paymentIntentId,
            customerId,
            status,
        } = await req.json();

        await dbConfig();

        const order = await OrderModel.findOne({ orderID });

        const payment = await Payment.create({
            userID,
            orderID,
            paymentOption,
            paymentIntentId,
            customerId,
            status,
            amount: order.total,
        });

        order.paymentOption = 'Pay Later';
        await order.save();

        return NextResponse.json(
            {
                success: true,
                data: payment,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
