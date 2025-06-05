import dbConfig from '@/lib/dbConfig';
import RevisionModel from '@/models/revision.model';
import UserModel from '@/models/user.model';
import OrderModel from '@/models/order.model';
import { sendEmail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            orderID,
            senderID,
            senderName,
            senderProfileImage,
            senderRole,
            message,
        } = body;

        if (!orderID || !senderID || !senderRole || !message) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        await dbConfig();

        const revision = await RevisionModel.findOneAndUpdate(
            { orderID },
            {
                $push: {
                    messages: {
                        orderID,
                        senderID,
                        senderName,
                        senderProfileImage,
                        senderRole,
                        message,
                    },
                },
                $set: {
                    isSeenByAdmin: senderRole === 'User' ? false : true,
                    isSeenByUser:
                        senderRole === 'Admin' ||
                        senderRole === 'SuperAdmin' ||
                        senderRole === 'Developer'
                            ? false
                            : true,
                },
            },
            { new: true }
        );

        if (!revision) {
            return NextResponse.json(
                { success: false, message: 'Revision thread not found.' },
                { status: 404 }
            );
        }

        const order = await OrderModel.findOne({ orderID });
        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found.' },
                { status: 404 }
            );
        }

        let recipientEmail = '';
        let recipientName = '';
        if (
            senderRole === 'Admin' ||
            senderRole === 'SuperAdmin' ||
            senderRole === 'Developer'
        ) {
            const user = await UserModel.findOne({ userID: order.userID });
            if (!user || !user.email) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'User not found or missing email.',
                    },
                    { status: 404 }
                );
            }
            recipientEmail = user.email;
            recipientName = user.name || 'there';
        }

        if (recipientEmail) {
            const subject = '📩 New Reply to Your Revision Request';
            const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${recipientName},</h2>
                    <p>You’ve received a new message on your order <strong>#${orderID}</strong>.</p>
                    <div style="background-color: #f4f4f4; padding: 12px 16px; margin: 20px 0; border-left: 4px solid #007bff;">
                        <p><strong>${senderRole}:</strong> ${message}</p>
                    </div>
                    <a href="${
                        process.env.NEXT_PUBLIC_BASE_URL
                    }/orders/details/${orderID}" 
                       style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; border-radius: 5px; text-decoration: none;">
                        View Order
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">© ${new Date().getFullYear()} Web Briks LLC</p>
                </div>
            `;

            await sendEmail({
                from: recipientEmail,
                to: process.env.EMAIL_USER!,
                subject,
                html,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Reply added and email sent (if applicable).',
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
