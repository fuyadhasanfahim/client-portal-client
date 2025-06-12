// /app/api/messages/set-message/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import { MessageModel } from '@/models/message.model';
import UserModel from '@/models/user.model';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            orderID,
            senderID,
            content,
            status = 'sent',
            conversationID,
        } = body;

        console.log({
            orderID,
            senderID,
            content,
            status,
            conversationID,
        });

        if (!orderID || !senderID || !content || !conversationID) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields.' },
                { status: 400 }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({ userID: senderID }).select(
            'userID name email profileImage'
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Sender user not found.' },
                { status: 404 }
            );
        }

        const newMessage = await MessageModel.create({
            conversationID,
            orderID,
            senderID,
            content,
            status,
            attachments: [],
        });

        const responseData = {
            _id: newMessage._id,
            conversationID,
            orderID: newMessage.orderID,
            content: newMessage.content,
            status: newMessage.status,
            createdAt: newMessage.createdAt,
            sender: {
                userID: user.userID,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
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
