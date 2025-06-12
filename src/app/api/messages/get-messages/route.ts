import { NextRequest, NextResponse } from 'next/server';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { MessageModel } from '@/models/message.model';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orderID = searchParams.get('orderID');

        if (!orderID) {
            return NextResponse.json(
                { success: false, message: 'Missing orderID' },
                { status: 400 }
            );
        }

        await dbConfig();

        const messages = await MessageModel.find({ orderID })
            .sort({ createdAt: 1 })
            .populate({
                path: 'senderID',
                model: UserModel,
                select: 'userID name email profileImage',
                localField: 'senderID',
                foreignField: 'userID',
                justOne: true,
            });

        const formattedMessages = messages.map((msg) => ({
            _id: msg._id,
            content: msg.content,
            orderID: msg.orderID,
            createdAt: msg.createdAt,
            sender: {
                userID: msg.senderID.userID,
                name: msg.senderID.name,
                email: msg.senderID.email,
                profileImage: msg.senderID.profileImage,
            },
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedMessages,
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
