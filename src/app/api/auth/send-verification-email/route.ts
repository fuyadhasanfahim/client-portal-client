import { generateToken } from '@/utils/generateToken';
import { sendEmail } from '@/lib/nodemailer';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email is required',
                },
                {
                    status: 400,
                }
            );
        }

        await dbConfig();
        const user = await UserModel.findOne({ email });

        if (!user || user.isEmailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or already verified',
                },
                {
                    status: 400,
                }
            );
        }

        const token = generateToken();
        user.emailVerificationToken = token;
        user.emailVerificationTokenExpiry = new Date(
            Date.now() + 1000 * 60 * 60
        );
        await user.save();

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
        await sendEmail({
            to: email,
            subject: 'Verify your email',
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
                                    background-color: #34a853;
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
                                    <h2>Verify Your Email Address</h2>
                                </div>
                                <div class="content">
                                    <p>Hello,</p>
                                    <p>Thank you for signing up! To complete your registration and verify your email address, please click the button below:</p>
                                    <div style="text-align: center;">
                                        <a href="${verificationUrl}" class="button">Verify Email</a>
                                    </div>
                                    <p>This link will expire in 48 hours.</p>
                                </div>
                                <div class="footer">
                                    <p>If you're having trouble clicking the button, copy and paste this URL into your browser: ${verificationUrl}</p>
                                    <p>&copy; 2025 Your Company. All rights reserved.</p>
                                </div>
                            </div>
                        </body>
                        </html>`,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Verification email sent',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error,
            },
            {
                status: 500,
            }
        );
    }
}
