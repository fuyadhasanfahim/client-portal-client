import dbConfig from '@/lib/dbConfig';
import { ConversationModel } from '@/models/message.model';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl);
        const role = searchParams.get('role');

        if (!role) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'The role is required for retrieving the data.',
                },
                {
                    status: 404,
                }
            );
        }

        await dbConfig();

        if (role === 'Admin' || role === 'SuperAdmin' || role === 'Developer') {
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
        }
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
