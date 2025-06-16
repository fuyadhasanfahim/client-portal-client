import { IMessage } from '@/types/message.interface';
import { format } from 'date-fns';

export default function ChatBubble({
    message,
    isOwn,
}: {
    message: IMessage;
    isOwn: boolean;
}) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`relative max-w-[80%] p-4 rounded-2xl transition-all duration-300 ${
                    isOwn
                        ? 'bg-green-600 text-white ml-12 rounded-br-none'
                        : 'bg-gray-100 text-gray-900 mr-12 rounded-bl-none'
                }`}
            >
                <p className="text-sm leading-snug">{message.content}</p>
                <p
                    className={`text-[11px] mt-2 text-right ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                    {format(message.createdAt, 'PPP')}
                </p>
            </div>
        </div>
    );
}
