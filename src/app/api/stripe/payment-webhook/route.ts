import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import PaymentModel from '@/models/payment.model';
import OrderSessionModel from '@/models/order-session.model';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        return new Response('Missing Stripe signature', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('[WEBHOOK_SIGNATURE_ERROR]', err);
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            const metadata = session.metadata;
            const orderSessionId = metadata?.orderSessionId;

            if (!orderSessionId) {
                console.error('Missing orderSessionId in metadata');
                return new Response('Invalid metadata', { status: 400 });
            }

            await dbConfig();

            const orderSession = await OrderSessionModel.findOne({
                sessionId: orderSessionId,
            });

            if (!orderSession) {
                console.error('Order session not found');
                return new Response('Order session not found', { status: 404 });
            }

            const fullOrder = orderSession.fullOrder;

            await OrderModel.create({
                ...fullOrder,
                isPaid: true,
            });

            await PaymentModel.create({
                userId: metadata.userId,
                orderId: metadata.orderId,
                paymentOption: metadata.paymentOption,
                paymentIntentId: session.payment_intent?.toString(),
                customerId: session.customer?.toString(),
                amount: session.amount_subtotal! / 100,
                tax: session.total_details?.amount_tax
                    ? session.total_details.amount_tax / 100
                    : 0,
                totalAmount: session.amount_total! / 100,
                currency: session.currency,
                status: session.payment_status,
                createdAt: new Date(),
            });

            console.log('✅ Order & Payment stored successfully');
        } catch (error) {
            console.error('[WEBHOOK_HANDLER_ERROR]', error);
            return new Response('Internal server error', { status: 500 });
        }
    }

    return new Response('OK', { status: 200 });
}
