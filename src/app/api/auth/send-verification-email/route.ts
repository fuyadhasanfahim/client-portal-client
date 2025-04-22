import { generateToken } from '@/utils/generateToken';
import { sendEmail } from '@/lib/nodemailer';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export default async function POST(req: NextRequest) {
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
        user.emailVerificationTokenExpiry =
            new Date().getTime() + 1000 * 60 * 60;
        await user.save();

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
        await sendEmail({
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
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
