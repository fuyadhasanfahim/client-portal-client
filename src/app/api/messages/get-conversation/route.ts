import dbConfig from '@/lib/dbConfig';
import { ConversationModel } from '@/models/message.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await dbConfig();

        const { searchParams } = new URL(req.nextUrl);
        const userID = searchParams.get('user_id');

        if (!userID) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User id is required',
                },
                { status: 400 }
            );
        }

        const conversations = await ConversationModel.findOne({
            participants: userID,
        });

        return NextResponse.json(
            {
                success: true,
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
