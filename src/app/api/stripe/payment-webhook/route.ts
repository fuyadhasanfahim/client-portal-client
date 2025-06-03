import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import PaymentModel from '@/models/payment.model';
import UserModel from '@/models/user.model';
import { sendEmail } from '@/lib/nodemailer';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const stripeSignature = req.headers.get('stripe-signature');
    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSignature || !stripeSecret) {
        return new Response('Missing Stripe signature or secret', {
            status: 400,
        });
    }

    let event: Stripe.Event;
    const rawBody = await req.text();

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            stripeSignature,
            stripeSecret
        );
    } catch (err) {
        console.error('Stripe signature verification failed:', err);
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata?.orderID || !metadata?.userID) {
            return new Response('Missing metadata in session', { status: 400 });
        }

        const {
            orderID,
            userID,
            paymentOption = 'stripe',
            paymentMethod = 'card',
        } = metadata;

        try {
            await dbConfig();

            await OrderModel.findByIdAndUpdate(orderID, {
                isPaid: true,
                paymentStatus: 'Paid',
                paymentOption,
                paymentMethod,
                paymentId: session.payment_intent?.toString(),
            });

            await PaymentModel.create({
                userID,
                orderID,
                paymentOption,
                paymentMethod,
                paymentIntentId: session.payment_intent?.toString(),
                customerId: session.customer?.toString(),
                amount: (session.amount_subtotal ?? 0) / 100,
                tax: (session.total_details?.amount_tax ?? 0) / 100,
                totalAmount: (session.amount_total ?? 0) / 100,
                currency: session.currency,
                status: session.payment_status,
            });

            const user = await UserModel.findOne({ userID });
            if (user?.email) {
                await sendEmail({
                    from: process.env.EMAIL_USER!,
                    to: process.env.EMAIL_USER!,
                    subject: `✅ Payment Completed - Order #${orderID}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; font-size: 15px;">
                            <h2>New Order Fulfilled</h2>
                            <p><strong>User ID:</strong> ${userID}</p>
                            <p><strong>Order ID:</strong> ${orderID}</p>
                            <p>Order has been marked as <strong>Paid</strong> and processed via Stripe.</p>
                        </div>
                    `,
                });
            }
        } catch (err) {
            console.error('Webhook processing error:', err);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    return new Response('OK', { status: 200 });
}
