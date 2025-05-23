import { NextRequest, NextResponse } from 'next/server';
import OrderModel from '@/models/order.model';
import dbConfig from '@/lib/dbConfig';
import { OrderServiceValidation } from '@/validations/order.schema';
import { z } from 'zod';

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
            });

            return NextResponse.json(
                {
                    success: true,
                    draftOrderId: newOrder._id.toString(),
                },
                { status: 201 }
            );
        } else if (orderId && !total) {
            if (
                !downloadLink ||
                !images ||
                !returnFileFormat ||
                !backgroundOption ||
                !instructions
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'All order details are required!',
                    },
                    { status: 404 }
                );
            }

            const order = await OrderModel.findById(orderId);
            if (!order) {
                return NextResponse.json(
                    { success: false, message: 'Order not found' },
                    { status: 404 }
                );
            }

            order.downloadLink = downloadLink;
            order.images = images;
            order.returnFileFormat = returnFileFormat;
            order.backgroundOption = backgroundOption;
            order.imageResizing = imageResizing;
            order.width = width;
            order.height = height;
            order.instructions = instructions;
            order.supportingFileDownloadLink = supportingFileDownloadLink;
            order.status = 'awaiting-payment';

            await order.save();

            return NextResponse.json(
                {
                    success: true,
                    orderId: order._id.toString(),
                },
                { status: 200 }
            );
        } else if (orderId && total) {
            const order = await OrderModel.findById(orderId);
            if (!order) {
                return NextResponse.json(
                    { success: false, message: 'Order not found' },
                    { status: 404 }
                );
            }

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
