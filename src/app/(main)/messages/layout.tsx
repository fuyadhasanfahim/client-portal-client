import MessageSidebar from '@/components/messages/MessageSidebar';
import { conversationsSeed } from '@/components/messages/data';

export default function MessageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="h-[calc(100vh-96px)] rounded-md shadow border bg-white overflow-hidden">
            <div className="h-full flex overflow-hidden">
                <MessageSidebar conversations={conversationsSeed} />
                <div className="flex-1 pt-2 min-w-0 min-h-0 h-full overflow-hidden">
                    {children}
                </div>
            </div>
        </section>
    );
}
