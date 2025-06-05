import dbConfig from '@/lib/dbConfig';
import { sendEmail } from '@/lib/nodemailer';
import OrderModel from '@/models/order.model';
import UserModel from '@/models/user.model';
import RevisionModel from '@/models/revision.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const orderID = searchParams.get('order_id');
        const userID = searchParams.get('user_id');
        const instruction = searchParams.get('instruction');

        if (!orderID || !userID || !instruction) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Missing required query parameters (order_id, user_id, instruction).',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        await RevisionModel.create({
            orderID,
            userID,
            message: instruction,
        });

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderID, userID },
            { status: 'In Revision' },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { success: false, message: 'Order not found.' },
                { status: 404 }
            );
        }

        const user = await UserModel.findOne({ userID });
        if (!user || !user.email) {
            return NextResponse.json(
                { success: false, message: 'User not found or email missing.' },
                { status: 404 }
            );
        }

        const subject = '🔁 Revision Requested for Your Order';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        background-color: #fff;
                        border-radius: 8px;
                        padding: 30px;
                        max-width: 600px;
                        margin: auto;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    }
                    .highlight {
                        background-color: #e7f3ff;
                        border-left: 4px solid #2196F3;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                    }
                    a.button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 24px;
                        background-color: #007bff;
                        color: #fff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Hi ${user.name || 'there'},</h2>
                    <p>Your order <strong>#${orderID}</strong> has been marked as <strong>In Revision</strong>.</p>

                    <div class="highlight">
                        <strong>Revision Instructions:</strong><br/>
                        ${instruction}
                    </div>

                    <p>We'll begin working on your requested changes shortly.</p>

                    <a class="button" href="${
                        process.env.NEXT_PUBLIC_BASE_URL
                    }/orders/details/${orderID}">
                        View Your Order
                    </a>

                    <div class="footer">
                        © ${new Date().getFullYear()} Web Briks LLC – All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail({
            from: `"Web Briks LLC" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject,
            html,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Revision recorded and email sent to user.',
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
