import dbConfig from '@/lib/dbConfig';
import { ConversationModel } from '@/models/message.model';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'The email is required for retrieving the data.',
                },
                {
                    status: 400,
                }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({
            email,
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                }
            );
        }

        let conversations = [];

        if (user.role === 'SuperAdmin' || user.role === 'Admin') {
            conversations = await ConversationModel.find().sort({
                createdAt: -1,
            });
        }

        if (user.role === 'User') {
            conversations = await ConversationModel.findOne({
                participants: user.userID,
            }).sort({
                createdAt: -1,
            });
        }

        return NextResponse.json(
            {
                success: true,
                data: conversations,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong while sending message.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
