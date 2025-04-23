import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/utils/generateToken';
import { sendEmail } from '@/lib/nodemailer';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';

export async function POST(req: NextRequest) {
    try {
        await dbConfig();
        const { email } = await req.json();
        const user = await UserModel.findOne({ email });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 400 }
            );
        }

        if (user.provider === 'google') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please login with Google',
                },
                { status: 400 }
            );
        }

        const token = generateToken();
        user.forgetPasswordToken = token;
        user.forgetPasswordTokenExpiry = new Date().getTime() + 1000 * 60 * 30;
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: email,
            subject: 'Reset Password',
            html: `<!DOCTYPE html>
                        <html>
                            <head>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        line-height: 1.6;
                                        color: #333333;
                                        max-width: 600px;
                                        margin: 0 auto;
                                    }
                                    .email-container {
                                        border: 1px solid #e0e0e0;
                                        border-radius: 5px;
                                        padding: 20px;
                                        background-color: #ffffff;
                                    }
                                    .header {
                                        text-align: center;
                                        padding-bottom: 20px;
                                        border-bottom: 1px solid #e0e0e0;
                                    }
                                    .content {
                                        padding: 30px 0;
                                    }
                                    .button {
                                        display: inline-block;
                                        background-color: #4285f4;
                                        color: #FFFFFF;
                                        text-decoration: none;
                                        padding: 12px 25px;
                                        border-radius: 4px;
                                        font-weight: bold;
                                        margin: 20px 0;
                                    }
                                    .footer {
                                        font-size: 12px;
                                        color: #777777;
                                        text-align: center;
                                        padding-top: 20px;
                                        border-top: 1px solid #e0e0e0;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="email-container">
                                    <div class="header">
                                        <h2>Password Reset Request</h2>
                                    </div>
                                    <div class="content">
                                        <p>Hello,</p>
                                        <p>
                                            We received a request to reset your password. To complete
                                            the process, please click the button below:
                                        </p>
                                        <div style="text-align: center">
                                            <a href="${resetUrl}" class="button">Reset Password</a>
                                        </div>
                                        <p>
                                            If you didn't request a password reset, you can safely
                                            ignore this email.
                                        </p>
                                        <p>This link will expire in 24 hours.</p>
                                    </div>
                                    <div class="footer">
                                        <p>
                                            If you're having trouble clicking the button, copy and paste
                                            this URL into your browser: ${resetUrl}
                                        </p>
                                        <p>&copy; 2025 Your Company. All rights reserved.</p>
                                    </div>
                                </div>
                            </body>
                        </html>`,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Password reset email sent',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal Server Error', error },
            { status: 500 }
        );
    }
}
