import dbConfig from '@/lib/dbConfig';
import { sendEmail } from '@/lib/nodemailer';
import OrderModel from '@/models/order.model';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const orderID = searchParams.get('order_id');
        const senderID = searchParams.get('sender_id');
        const senderRole = searchParams.get('sender_role');
        const message = searchParams.get('message');

        if (!orderID || !senderID || !senderRole || !message) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Missing required query parameters (order_id, sender_id, sender_role, message).',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderID },
            { status: 'In Revision' },
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

        const user = await UserModel.findOne({ userID: updatedOrder.userID });
        if (!user || !user.email) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found or user email missing.',
                },
                { status: 404 }
            );
        }

        const subject =
            senderRole === 'User'
                ? '🔁 Revision Requested for Your Order'
                : '✉️ Admin Replied to Your Revision Request';

        const html = `
            <!DOCTYPE html>
            <html><head><style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; color: #333; }
                .container { background: #fff; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
                .highlight { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
                a.button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
            </style></head><body>
            <div class="container">
                <h2>Hello ${user.name || 'there'},</h2>
                <p>Your order <strong>#${orderID}</strong> has a new revision message from <strong>${senderRole}</strong>.</p>
                <div class="highlight"><strong>Message:</strong><br/>${message}</div>
                <p>You can view the full revision thread and respond if needed.</p>
                <a class="button" href="${
                    process.env.NEXT_PUBLIC_BASE_URL
                }/orders/details/${orderID}">View Order & Reply</a>
                <div class="footer">© ${new Date().getFullYear()} Web Briks LLC – All rights reserved.</div>
            </div>
            </body></html>
        `;

        const admin = await UserModel.findOne({
            role: { $in: ['SuperAdmin', 'Admin', 'Developer'] },
        });

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Admin user not found.',
                },
                { status: 404 }
            );
        }
        await sendEmail({
            from:user.email!,
            to: process.env.EMAIL_USER!,
            subject,
            html,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Revision message sent to email.',
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong while processing the revision.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
