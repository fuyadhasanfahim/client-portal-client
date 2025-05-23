import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import PaymentModel from '@/models/payment.model';
import UserModel from '@/models/user.model';
import { sendEmail } from '@/lib/nodemailer';

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
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            const metadata = session.metadata;
            const orderId = metadata?.orderId;
            const userId = metadata?.userId;

            if (!orderId || !userId) {
                return new Response('Invalid metadata', { status: 400 });
            }

            await dbConfig();

            await OrderModel.findByIdAndUpdate(orderId, {
                isPaid: true,
                status: 'paid',
                paymentOption: metadata.paymentOption,
                paymentMethod: metadata.paymentMethod,
                paymentId: session.payment_intent?.toString(),
            });

            await PaymentModel.create({
                userId,
                orderId,
                paymentOption: metadata.paymentOption,
                paymentMethod: metadata.paymentMethod,
                paymentIntentId: session.payment_intent?.toString(),
                customerId: session.customer?.toString(),
                amount: session.amount_subtotal! / 100,
                tax: session.total_details?.amount_tax
                    ? session.total_details.amount_tax / 100
                    : 0,
                totalAmount: session.amount_total! / 100,
                currency: session.currency,
                status: session.payment_status,
            });

            const user = await UserModel.findOne({ userId });
            if (user?.email) {
                const email = {
                    from: process.env.EMAIL_USER!,
                    to: process.env.EMAIL_USER!,
                    subject: `✅ Payment Completed - Order #${orderId}`,
                    html: `
                        <div style="font-family: Arial; font-size: 15px;">
                            <h2>New Order Fulfilled</h2>
                            <p><strong>User ID:</strong> ${userId}</p>
                            <p><strong>Order ID:</strong> ${orderId}</p>
                            <p>Order has been marked as <strong>fulfilled</strong> and payment was successfully processed via Stripe.</p>
                        </div>
                        `,
                };

                await sendEmail(email);
            }
        } catch (error) {
            console.log('Stripe webhook error', error);
            return new Response('Webhook processing error', { status: 500 });
        }
    }

    return new Response('OK', { status: 200 });
}
