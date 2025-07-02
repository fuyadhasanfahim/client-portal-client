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

            // First check if a payment for this order already exists
            const existingPayment = await PaymentModel.findOne({
                orderID,
            });

            const paymentIntentId = session.payment_intent?.toString();
            const paymentData = {
                userID,
                orderID,
                paymentOption,
                paymentMethod,
                customerId: session.customer?.toString(),
                amount: (session.amount_subtotal ?? 0) / 100,
                tax: (session.total_details?.amount_tax ?? 0) / 100,
                totalAmount: (session.amount_total ?? 0) / 100,
                currency: session.currency,
                status: session.payment_status,
                paymentIntentId,
            };

            if (existingPayment) {
                // Update existing payment
                await PaymentModel.updateOne(
                    { _id: existingPayment._id },
                    paymentData
                );
                console.log(`Updated existing payment for order ${orderID}`);
            } else {
                // Create new payment
                await PaymentModel.create(paymentData);
                console.log(`Created new payment for order ${orderID}`);
            }

            // Update the order
            await OrderModel.findOneAndUpdate(
                { orderID },
                {
                    isPaid: true,
                    paymentStatus: 'Paid',
                    paymentOption,
                    paymentMethod,
                    paymentId: paymentIntentId,
                },
                { new: true }
            );

            console.log(`Updated order ${orderID} payment status`);

            // Send confirmation email
            const user = await UserModel.findOne({ userID });

            if (user?.email) {
                await sendEmail({
                    from: process.env.EMAIL_USER!,
                    to: user.email,
                    subject: `✅ Payment Completed - Order #${orderID}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
                            <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
                                <h2 style="color: #0f9d58; margin-bottom: 12px;">🎉 Payment Confirmed!</h2>

                                <p>Hi ${user.name || 'there'},</p>

                                <p>Thank you for your payment! We're excited to let you know that your order has been successfully marked as <strong style="color: #0f9d58;">Paid</strong> and is now being processed via <strong>Stripe</strong>.</p>

                                <div style="margin: 20px 0; padding: 16px; background-color: #f9f9f9; border-left: 4px solid #0f9d58;">
                                <p><strong>User ID:</strong> ${userID}</p>
                                <p><strong>Order ID:</strong> ${orderID}</p>
                                <p><strong>Amount Paid:</strong> ${
                                    (session.amount_total ?? 0) / 100
                                } ${session.currency?.toUpperCase()}</p>
                                </div>

                                <p>You can expect an update once your order is completed and ready for delivery.</p>

                                <p>If you have any questions, feel free to reach out to us anytime.</p>

                                <p style="margin-top: 30px;">Best regards,<br /><strong>The Project Pixel Forge Team</strong></p>
                            </div>
                        </div>
                    `,
                });
                console.log(`Sent confirmation email for order ${orderID}`);
            }
        } catch (err) {
            console.error('Webhook processing error:', err);
            return new Response('Internal Server Error', { status: 500 });
        }
    }

    return new Response('OK', { status: 200 });
}
