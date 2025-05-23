import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import { stripe } from '@/lib/stripe';
import { nanoid } from 'nanoid';
import OrderModel from '@/models/order.model';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, paymentOption, paymentMethod } = body;

        if (!orderId || !paymentOption || !paymentMethod) {
            return NextResponse.json(
                { success: false, message: 'Missing orderId' },
                { status: 400 }
            );
        }

        await dbConfig();

        const order = await OrderModel.findById(orderId);
        if (!order || !order.total) {
            return NextResponse.json(
                { success: false, message: 'Order not found or missing total' },
                { status: 404 }
            );
        }

        const orderSessionId = nanoid(10);

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            ui_mode: 'embedded',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Order #${orderId}`,
                        },
                        unit_amount: Math.round(order.total * 100),
                    },
                    quantity: 1,
                },
            ],
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/order-payment/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                orderId,
                userId: order.userId,
                orderSessionId,
                paymentOption,
                paymentMethod,
            },
        });

        return NextResponse.json({ client_secret: session.client_secret });
    } catch (error) {
        console.error('Stripe checkout session error', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Stripe session creation failed.',
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
