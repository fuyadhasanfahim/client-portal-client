import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { MessageModel } from '@/models/message.model';
import { IMessage } from '@/types/message.interface';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationID = searchParams.get('conversationID');
        console.log(searchParams)

        if (!conversationID) {
            return NextResponse.json(
                { success: false, message: 'Missing conversationID' },
                { status: 400 }
            );
        }

        await dbConfig();

        const messages = await MessageModel.find({ conversationID })
            .sort({ createdAt: 1 })
            .populate({
                path: 'sender',
                model: UserModel,
                select: 'userID name email profileImage isOnline',
            });

            console.log(messages)
 
        const formattedMessages: IMessage[] = messages.map((msg) => ({
            _id: msg._id?.toString(),
            conversationID: msg.conversationID,
            content: msg.content,
            status: msg.status || 'sent',
            createdAt: msg.createdAt,
            sender: {
                userID: msg.sender.userID,
                name: msg.sender.name,
                email: msg.sender.email,
                profileImage: msg.sender.profileImage,
                isOnline: msg.sender.isOnline || false,
            },
            attachments: msg.attachments || [],
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedMessages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
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
