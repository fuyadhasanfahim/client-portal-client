'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { IconSend } from '@tabler/icons-react';

// Sample data
const mockConversations = [
    {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: '/avatars/alice.jpg',
        lastMessage: 'Hey, how are you doing today?',
        timestamp: '2 min ago',
        unreadCount: 3,
        isOnline: true,
    },
    {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: '/avatars/bob.jpg',
        lastMessage: 'Can we schedule a meeting for tomorrow?',
        timestamp: '1 hr ago',
        unreadCount: 1,
        isOnline: false,
    },
    {
        id: 3,
        name: 'Carol Wilson',
        email: 'carol@example.com',
        avatar: '/avatars/carol.jpg',
        lastMessage: 'Thanks for your help with the project!',
        timestamp: '3 hrs ago',
        unreadCount: 0,
        isOnline: true,
    },
];

const mockMessages = [
    {
        id: 1,
        content: 'Hey, how are you doing today?',
        timestamp: '10:30 AM',
        isOwn: false,
    },
    {
        id: 2,
        content: "I'm doing great, thanks for asking! How about you?",
        timestamp: '10:32 AM',
        isOwn: true,
    },
    {
        id: 3,
        content:
            'Pretty good! I wanted to discuss the upcoming project with you.',
        timestamp: '10:33 AM',
        isOwn: false,
    },
    {
        id: 4,
        content: "Sure, I'd love to hear about it. What do you have in mind?",
        timestamp: '10:35 AM',
        isOwn: true,
    },
];

export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(
        mockConversations[0]
    );
    const [messageText, setMessageText] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = mockConversations.filter(
        (conv) =>
            conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        console.log('Sending message:', messageText);
        setMessageText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className="h-[calc(100vh-96px)] overflow-hidden py-0">
            <div className="grid grid-cols-12 h-full">
                <Sidebar
                    conversations={filteredConversations}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                />
                <ChatArea
                    selectedConversation={selectedConversation}
                    messages={mockMessages}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    handleSendMessage={handleSendMessage}
                    handleKeyPress={handleKeyPress}
                />
            </div>
        </Card>
    );
}

function Sidebar({
    conversations,
    selectedConversation,
    setSelectedConversation,
}: {
    conversations: {
        id: number;
        name: string;
        email: string;
        avatar: string;
        lastMessage: string;
        timestamp: string;
        unreadCount: number;
        isOnline: boolean;
    }[];
    selectedConversation: Conversation;
    setSelectedConversation: (conv: Conversation) => void;
}) {
    return (
        <div className="col-span-3 border-r border-border">
            <CardHeader className="p-4 py-[23px]">
                <CardTitle className="text-2xl">Messages</CardTitle>
            </CardHeader>
            <Separator />
            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-2">
                    {conversations.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedConversation.id === conv.id}
                            onClick={() => setSelectedConversation(conv)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function ConversationItem({
    conversation,
    isSelected,
    onClick,
}: {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                isSelected ? 'bg-muted' : ''
            }`}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar className="h-12 w-12">
                        <AvatarImage
                            src={conversation.avatar}
                            alt={conversation.name}
                        />
                        <AvatarFallback>
                            {getInitials(conversation.name)}
                        </AvatarFallback>
                    </Avatar>
                    {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate">
                            {conversation.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                                {conversation.timestamp}
                            </span>
                            {conversation.unreadCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="h-5 min-w-5 text-xs px-1.5"
                                >
                                    {conversation.unreadCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                        {conversation.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                    </p>
                </div>
            </div>
        </div>
    );
}

type Conversation = {
    id: number;
    name: string;
    email: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
};

type Message = {
    id: number;
    content: string;
    timestamp: string;
    isOwn: boolean;
};

interface ChatAreaProps {
    selectedConversation: Conversation;
    messages: Message[];
    messageText: string;
    setMessageText: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent) => void;
}

function ChatArea({
    selectedConversation,
    messages,
    messageText,
    setMessageText,
    handleSendMessage,
    handleKeyPress,
}: ChatAreaProps) {
    return (
        <CardContent className="col-span-9 flex flex-col h-full px-0">
            <ChatHeader user={selectedConversation} />
            <Separator />
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                    <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 max-h-32 resize-none"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        size={'icon'}
                    >
                        <IconSend size={24} />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </CardContent>
    );
}

function ChatHeader({
    user,
}: {
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string;
        lastMessage: string;
        timestamp: string;
        unreadCount: number;
        isOnline: boolean;
    };
}) {
    return (
        <div className="p-4 bg-muted/30">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">
                        {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {user.isOnline ? (
                            <span className="text-green-600">● Online</span>
                        ) : (
                            <span className="text-gray-500">● Offline</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ChatBubble({
    message,
}: {
    message: { id: number; content: string; timestamp: string; isOwn: boolean };
}) {
    return (
        <div
            className={`flex ${
                message.isOwn ? 'justify-end' : 'justify-start'
            }`}
        >
            <div
                className={`max-w-[70%] p-3 rounded-lg ${
                    message.isOwn
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted mr-12'
                }`}
            >
                <p className="text-sm">{message.content}</p>
                <p
                    className={`text-xs mt-1 ${
                        message.isOwn
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                    }`}
                >
                    {message.timestamp}
                </p>
            </div>
        </div>
    );
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('');
}
