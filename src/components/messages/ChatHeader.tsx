import { IMessageUser } from '@/types/message.interface';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


export default function ChatHeader({ user }: { user: IMessageUser }) {
    return (
        <div className="p-4 bg-muted/30">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} alt={user.name} />
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

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('');
}
