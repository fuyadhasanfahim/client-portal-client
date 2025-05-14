import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    'Webhook Error. Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            { status: 400 }
        );
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        console.log('✅ Payment completed for Order ID:', orderId);
    }

    return NextResponse.json({ received: true });
}
