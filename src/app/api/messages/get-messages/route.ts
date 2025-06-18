import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { MessageModel, ConversationModel } from '@/models/message.model';
import { IMessage } from '@/types/message.interface';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationID = searchParams.get('conversation_id');
        const userID = searchParams.get('user_id');

        await dbConfig();

        let conversation;

        if (conversationID) {
            conversation = await ConversationModel.findById(conversationID);
            if (!conversation) {
                return NextResponse.json(
                    { success: false, message: 'Conversation not found' },
                    { status: 404 }
                );
            }
        } else if (userID) {
            conversation = await ConversationModel.findOne({
                participants: userID,
            });
            if (!conversation) {
                return NextResponse.json(
                    { success: true, data: [] },
                    { status: 200 }
                );
            }
        } else {
            return NextResponse.json(
                { success: false, message: 'Missing conversationID or userID' },
                { status: 400 }
            );
        }

        const messages = await MessageModel.find({
            conversationID: conversation._id,
        })
            .sort({ createdAt: 1 })
            .populate({
                path: 'sender',
                model: UserModel,
                select: 'userID name email profileImage isOnline',
            });

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
                role: msg.sender.role,
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
        console.log(error);
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
