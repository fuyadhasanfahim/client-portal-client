import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { IMessage, IUserTypingStatus } from '@/types/message.interface';
import { ConversationModel, MessageModel } from '@/models/message.model';

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

export default function SocketHandler(
    _req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server');
        const httpServer: NetServer = res.socket.server;
        const io = new SocketIOServer(httpServer, {
            path: '/api/socketio',
        });

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on('joinUserRoom', (userId: string) => {
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
            });

            socket.on('joinConversation', (conversationId: string) => {
                socket.join(conversationId);
                console.log(`User joined conversation ${conversationId}`);
            });

            socket.on('sendMessage', async (messageData: IMessage) => {
                try {
                    const message = new MessageModel(messageData);
                    await message.save();

                    const populatedMessage = await MessageModel.findById(
                        message._id
                    )
                        .populate({
                            path: 'senderID',
                            select: 'userID name email profileImage isOnline',
                        })
                        .lean();

                    if (!populatedMessage) return;

                    const msg = Array.isArray(populatedMessage)
                        ? populatedMessage[0]
                        : populatedMessage;
                    if (!msg) return;

                    const normalizedMessage: IMessage = {
                        _id: (
                            msg._id as string | { toString(): string }
                        ).toString(),
                        conversationID: msg.conversationID.toString(),
                        content: msg.content,
                        createdAt: msg.createdAt.toString(),
                        status: 'sent',
                        attachments: msg.attachments || [],
                        sender: {
                            userID: msg.senderID.userID,
                            name: msg.senderID.name,
                            email: msg.senderID.email,
                            profileImage: msg.senderID.profileImage,
                            isOnline: msg.senderID.isOnline,
                        },
                    };

                    io.to(normalizedMessage.sender.userID).emit(
                        'receiveMessage',
                        normalizedMessage
                    );

                    await updateUnreadCounts(
                        normalizedMessage.conversationID,
                        normalizedMessage.sender.userID
                    );
                } catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('messageError', {
                        error: 'Failed to send message',
                    });
                }
            });

            socket.on('typing', (data: IUserTypingStatus) => {
                socket.to(data.conversationID).emit('userTyping', data);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
}

async function updateUnreadCounts(conversationId: string, senderId: string) {
    // Implement your unread counts logic here
    await ConversationModel.findByIdAndUpdate(conversationId, {
        $inc: {
            [`unreadCounts.${senderId}`]: 0,
        },
        $addToSet: {
            readBy: senderId,
        },
    });
}
