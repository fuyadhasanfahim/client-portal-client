import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { z } from 'zod';
import { OrderServiceValidation } from '@/validations/order.schema';

const OrderServicesValidation = z.object({
    services: z.array(OrderServiceValidation).min(1),
});

export async function POST(req: NextRequest) {
    try {
        await dbConfig();
        const body = await req.json();
        const {
            userId,
            services,
            orderId,
            downloadLink,
            images,
            returnFileFormat,
            backgroundOption,
            imageResizing,
            width,
            height,
            instructions,
            supportingFileDownloadLink,
            total,
            paymentOption,
        } = body.data;

        if (!orderId) {
            const parsed = OrderServicesValidation.safeParse({ services });

            if (!parsed.success) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: parsed.error.flatten().fieldErrors,
                    },
                    { status: 400 }
                );
            }

            const newOrder = await OrderModel.create({
                userId,
                services,
                status: 'awaiting-details',
            });

            return NextResponse.json(
                {
                    success: true,
                    draftOrderId: newOrder._id.toString(),
                },
                { status: 201 }
            );
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const isDetailsStep =
            downloadLink ||
            images ||
            returnFileFormat ||
            backgroundOption ||
            instructions;

        if (isDetailsStep && typeof total !== 'number') {
            if (
                !downloadLink ||
                typeof images !== 'number' ||
                !returnFileFormat ||
                !backgroundOption ||
                !instructions
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'All required order details must be provided.',
                    },
                    { status: 400 }
                );
            }

            Object.assign(order, {
                downloadLink,
                images,
                returnFileFormat,
                backgroundOption,
                imageResizing,
                width,
                height,
                instructions,
                supportingFileDownloadLink,
                status: 'awaiting-payment',
            });

            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    orderId: order._id.toString(),
                },
                { status: 200 }
            );
        }

        if (typeof total === 'number') {
            order.total = total;
            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    orderId: order._id.toString(),
                },
                { status: 200 }
            );
        }

        if (paymentOption === 'pay-later') {
            order.paymentOption = paymentOption;
            order.status = 'awaiting-payment';
            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    message: 'Payment option saved as pay-later',
                    orderId: order._id.toString(),
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Invalid data submitted' },
            { status: 400 }
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
