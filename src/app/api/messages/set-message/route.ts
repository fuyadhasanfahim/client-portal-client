import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import { ConversationModel, MessageModel } from '@/models/message.model';
import UserModel from '@/models/user.model';
import { IMessage, IMessageUser } from '@/types/message.interface';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sender, content }: { sender: IMessageUser; content: string } =
            body;

        if (!sender || !content) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        await dbConfig();

        const admin = await UserModel.findOne({
            role: { $in: ['SuperAdmin', 'Admin', 'Developer'] },
        });

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Admin user not found.',
                },
                { status: 404 }
            );
        }

        const receiver: IMessageUser = {
            userID: admin.userID,
            email: admin.email,
            name: admin.name,
            profileImage: admin.profileImage,
            role: admin.role,
            isOnline: true,
        };

        let conversation = await ConversationModel.findOne({
            participants: sender.userID,
        });

        if (!conversation) {
            conversation = await ConversationModel.create({
                participants: [sender.userID, receiver.userID],
                unreadCounts: { [receiver.userID]: 1 },
                readBy: [sender.userID],
                createdAt: new Date(),
                participantsInfo: [sender, receiver],
            });
        } else {
            conversation.unreadCounts[receiver.userID] =
                (conversation.unreadCounts[receiver.userID] || 0) + 1;
            conversation.readBy = [sender.userID];
            await conversation.save();
        }

        const newMessage: IMessage = await MessageModel.create({
            sender: sender,
            conversationID: conversation._id,
            content,
            status: 'sent',
            attachments: [],
        });

        conversation.lastMessage = {
            _id: newMessage._id,
            conversationID: conversation._id,
            content: newMessage.content,
            status: newMessage.status,
            createdAt: newMessage.createdAt,
            sender: {
                userID: sender.userID,
                name: sender.name,
                email: sender.email,
                profileImage: sender.profileImage,
                isOnline: sender.isOnline,
                role: sender.role,
            },
        };

        await conversation.save();

        const responseData: IMessage = {
            _id: newMessage._id,
            conversationID: conversation._id,
            content: newMessage.content,
            status: newMessage.status,
            createdAt: newMessage.createdAt,
            sender: {
                userID: sender.userID,
                name: sender.name,
                email: sender.email,
                profileImage: sender.profileImage,
                role: sender.role,
                isOnline: sender.isOnline,
            },
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Message sent successfully.',
                data: responseData,
            },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
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
