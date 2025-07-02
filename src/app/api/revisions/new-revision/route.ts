import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { sendEmail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { orderID, senderID, senderRole, message } = body;

        if (!orderID || !senderID || !senderRole || !message) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        await dbConfig();

        const sender = await UserModel.findOne({
            userID: senderID,
        });

        const subject = '📩 New Reply to Your Revision Request';
        const html = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${process.env.EMAIL_USER!},</h2>
                    <p>You’ve received a new message on your order <strong>#${orderID}</strong>.</p>
                    <div style="background-color: #f4f4f4; padding: 12px 16px; margin: 20px 0; border-left: 4px solid #007bff;">
                        <p><strong>${sender.name}:</strong> ${message}</p>
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
            from: sender.email!,
            to: process.env.EMAIL_USER!,
            subject,
            html,
        });

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
