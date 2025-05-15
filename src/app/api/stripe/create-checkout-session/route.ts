import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, userId, price } = body;

        if (!orderId || !userId || !price) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing orderId, userId, or price',
                },
                { status: 400 }
            );
        }

        await dbConfig();

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
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            return_url: `https://your-site.com/order/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                orderId,
                userId,
            },
        });

        return NextResponse.json({ client_secret: session.client_secret });
    } catch (error) {
        console.error('[STRIPE_CREATE_SESSION_ERROR]', error);
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
