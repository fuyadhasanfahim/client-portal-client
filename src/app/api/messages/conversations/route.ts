import dbConfig from '@/lib/dbConfig';
import { ConversationModel } from '@/models/message.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConfig();

        const { searchParams } = new URL(req.nextUrl);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User id is required',
                },
                {
                    status: 400,
                }
            );
        }

        const conversations = await ConversationModel.find({
            participants: userId,
        })
            .populate('participants', 'username image')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username image',
                },
            })
            .sort({ updatedAt: -1 });

        return NextResponse.json(
            {
                success: false,
                data: conversations,
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
