import dbConfig from '@/lib/dbConfig';
import { sendEmail } from '@/lib/nodemailer';
import OrderModel from '@/models/order.model';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const orderID = searchParams.get('order_id');
        const orderStatus = searchParams.get('order_status');
        const userID = searchParams.get('user_id');
        const OrderDownloadLink = searchParams.get('download_link');

        if (!orderID || !orderStatus || !userID || !OrderDownloadLink) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required query parameters.',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderID, userID },
            { status: orderStatus, downloadLink: OrderDownloadLink },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Order not found.',
                },
                { status: 404 }
            );
        }

        const user = await UserModel.findOne({ userID });
        if (!user || !user.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found or email missing.',
                },
                { status: 404 }
            );
        }

        await sendEmail({
            from: `"Web Briks LLC" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🎉 Your Order is Ready – Please Review',
            html: `<!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        background-color: #f4f4f4;
                                        color: #333;
                                    }
                                    .container {
                                        max-width: 600px;
                                        margin: 40px auto;
                                        background-color: #ffffff;
                                        padding: 30px;
                                        border-radius: 10px;
                                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                                    }
                                    h2 {
                                        color: #222;
                                        margin-bottom: 10px;
                                    }
                                    p {
                                        font-size: 15px;
                                        line-height: 1.6;
                                        margin: 10px 0;
                                    }
                                    ul {
                                        padding-left: 18px;
                                        margin: 15px 0;
                                    }
                                    .button {
                                        display: inline-block;
                                        background-color: #007bff;
                                        color: #fff;
                                        text-decoration: none;
                                        padding: 12px 24px;
                                        border-radius: 6px;
                                        font-weight: bold;
                                        margin-top: 20px;
                                    }
                                    .footer {
                                        font-size: 12px;
                                        color: #888;
                                        text-align: center;
                                        margin-top: 40px;
                                        border-top: 1px solid #ddd;
                                        padding-top: 20px;
                                    }
                                    .logo {
                                        text-align: center;
                                        margin-bottom: 20px;
                                    }
                                    .logo img {
                                        max-width: 120px;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <div class="logo">
                                        <img src="https://yourdomain.com/logo.png" alt="Company Logo" />
                                    </div>
                                    <h2>Hi ${user.name || 'there'},</h2>
                                    <p>
                                        We're excited to let you know that your order
                                        <strong>#${orderID}</strong> has been <strong>delivered successfully! You can <a href=${OrderDownloadLink} class="button">
                                        download
                                    </a> form here.</strong>
                                    </p>
                                    <p>Please take a moment to review your files:</p>
                                    <ul>
                                        <li>If everything looks great, you can mark the order as <strong>Complete</strong>.</li>
                                        <li>Need some changes? Just click <strong>Request Revision</strong>.</li>
                                    </ul>

                                    <a href="${
                                        process.env.NEXT_PUBLIC_BASE_URL
                                    }/orders/details/${orderID}" class="button">
                                        Review Your Order
                                    </a>

                                    <p>We truly value your feedback and aim for 100% satisfaction.</p>

                                    <p>Thank you for trusting us with your project!</p>

                                    <p>Warm regards, <br /><strong>Your Company Name</strong></p>

                                    <div class="footer">
                                        © ${new Date().getFullYear()} Your Company Name. All rights reserved.<br />
                                        Need help? Contact us at <a href="mailto:${
                                            process.env.EMAIL_USER
                                        }">${process.env.EMAIL_USER}</a>
                                    </div>
                                </div>
                            </body>
                        </html>
                        `,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Order delivered and email sent to the user.',
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
