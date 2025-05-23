import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConfig from '@/lib/dbConfig';
import OrderModel from '@/models/order.model';
import PaymentModel from '@/models/payment.model';
import Stripe from 'stripe';
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

            const user = await UserModel.findOne({ userId: metadata.userId });

            await OrderModel.create({
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

            const email = {
                from: user.email,
                to: process.env.EMAIL_USER!,
                subject: `🧾 New Order Received from ${metadata.userId}`,
                html: `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                            <style>
                                body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f9f9f9;
                                padding: 20px;
                                color: #333;
                                }
                                .container {
                                max-width: 600px;
                                margin: auto;
                                background: #ffffff;
                                border-radius: 8px;
                                border: 1px solid #e5e5e5;
                                padding: 24px;
                                }
                                .header {
                                text-align: center;
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 16px;
                                margin-bottom: 24px;
                                }
                                .header h1 {
                                color: #34a853;
                                font-size: 24px;
                                margin: 0;
                                }
                                .content p {
                                margin-bottom: 16px;
                                font-size: 15px;
                                }
                                .highlight {
                                background-color: #f1f5f9;
                                padding: 10px 15px;
                                border-left: 4px solid #34a853;
                                margin: 12px 0;
                                font-family: monospace;
                                }
                                .footer {
                                font-size: 12px;
                                color: #888;
                                text-align: center;
                                margin-top: 32px;
                                border-top: 1px solid #e5e5e5;
                                padding-top: 16px;
                                }
                            </style>
                            </head>
                            <body>
                            <div class="container">
                                <div class="header">
                                <h1>🧾 New Order Submitted</h1>
                                </div>
                                <div class="content">
                                <p><strong>User ID:</strong> ${
                                    metadata.userId
                                }</p>
                                <p><strong>Order ID:</strong> ${
                                    metadata.orderId
                                }</p>
                                <p>A new order form has been submitted by the user. Please check the dashboard or your admin panel for full details and begin processing the order accordingly.</p>
                                <p class="highlight">No further action is required from the user. A confirmation email has been sent to them.</p>
                                </div>
                                <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Client Portal. All rights reserved.</p>
                                </div>
                            </div>
                            </body>
                            </html>`,
            };

            await sendEmail(email);

            console.log('✅ Order & Payment stored successfully');
        } catch (error) {
            console.error('[WEBHOOK_HANDLER_ERROR]', error);
            return new Response('Internal server error', { status: 500 });
        }
    }

    return new Response('OK', { status: 200 });
}
