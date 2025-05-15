import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import PaymentModel from '@/models/payment.model';
import { addOrderSchema } from '@/validations/add-order.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No data provided.',
                },
                { status: 400 }
            );
        }

        const result = addOrderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed.',
                    errors: result.error.format(),
                },
                { status: 422 }
            );
        }

        await dbConfig();

        const { paymentOption, userId, orderId, price } = result.data;

        const existingOrder = await OrderModel.findOne({ userId, orderId });
        if (existingOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Duplicate order. An order with this ID already exists.',
                },
                { status: 409 }
            );
        }

        if (paymentOption === 'Pay Later') {
            const existingPayment = await PaymentModel.findOne({
                userId,
                orderId,
            });
            if (existingPayment) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            'Duplicate payment. A pending payment for this order already exists.',
                    },
                    { status: 409 }
                );
            }

            await PaymentModel.create({
                userId,
                orderId,
                amount: price,
                status: 'Pending',
                paymentOption,
            });
        }

        await OrderModel.create(result.data);

        return NextResponse.json(
            {
                success: true,
                message: 'Order created successfully.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.log(error)
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
