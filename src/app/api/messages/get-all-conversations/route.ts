import dbConfig from '@/lib/dbConfig';
import { ConversationModel } from '@/models/message.model';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConfig();

        const conversations = await ConversationModel.find().sort({
            createdAt: -1,
        });

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
                message: 'Something went wrong.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
