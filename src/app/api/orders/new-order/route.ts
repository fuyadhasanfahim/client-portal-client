import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import { z } from 'zod';
import { OrderServiceValidation } from '@/validations/order.schema';
import { nanoid } from 'nanoid';

const OrderServicesValidation = z.object({
    services: z.array(OrderServiceValidation).min(1),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            userID,
            services,
            orderID,
            deliveryDate,
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

        await dbConfig();

        if (!orderID) {
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
                orderID: `ORDER-${nanoid(10)}`,
                userID,
                services,
                status: 'Pending',
                orderStatus: 'Awaiting For Details',
                paymentStatus: 'Pay Later',
            });

            return NextResponse.json(
                {
                    success: true,
                    draftOrderId: newOrder.orderID,
                },
                { status: 201 }
            );
        }

        const order = await OrderModel.findOne({ orderID });

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        const isDetailsStep =
            downloadLink ||
            typeof images === 'number' ||
            returnFileFormat ||
            backgroundOption ||
            instructions ||
            deliveryDate;

        if (isDetailsStep) {
            if (
                !downloadLink ||
                typeof images !== 'number' ||
                !returnFileFormat ||
                !backgroundOption ||
                !instructions ||
                !deliveryDate
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
                deliveryDate,
                downloadLink,
                images,
                returnFileFormat,
                backgroundOption,
                imageResizing,
                width,
                height,
                instructions,
                supportingFileDownloadLink,
                orderStatus: 'Waiting For Approval',
            });

            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    message: 'Order details saved',
                    orderID: order.orderID,
                },
                { status: 200 }
            );
        }

        if (typeof total === 'number') {
            order.total = total;
            order.paymentStatus = 'Pay Later';
            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    message: 'Order total saved',
                    orderID: order.orderID,
                },
                { status: 200 }
            );
        }

        if (paymentOption === 'Pay Later') {
            order.paymentOption = paymentOption;
            order.paymentStatus = 'Pay Later';
            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    message: 'Payment option saved as Pay Later',
                    orderID: order.orderID,
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Invalid or incomplete data submitted' },
            { status: 400 }
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
