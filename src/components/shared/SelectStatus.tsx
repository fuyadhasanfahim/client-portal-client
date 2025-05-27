import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { Icon } from '@tabler/icons-react';

export default function SelectStatus({
    data,
    status,
    handleUpdateStatus,
    isStatusUpdating,
    id,
    disabled,
    role,
}: {
    data: {
        id: number;
        value: string;
        icon: Icon;
        text: string;
        accessibleTo?: string[];
    }[];
    status: string;
    handleUpdateStatus: (params: {
        id: string;
        data: { status: string };
    }) => void;
    isStatusUpdating?: boolean;
    id: string;
    disabled?: boolean;
    role?: string;
}) {
    const isUser = role === 'User';
    const isDelivered = status === 'Delivered';
    const isCompleted = status === 'Completed';
    const isInRevision = status === 'In Revision';

    const isSelectDisabled =
        isStatusUpdating ||
        disabled ||
        (isUser && !isDelivered && ![''].includes(status)) ||
        (isUser && (isCompleted || isInRevision));

    return (
        <Select
            value={status}
            onValueChange={(newStatus) =>
                handleUpdateStatus({
                    id,
                    data: { status: newStatus },
                })
            }
            disabled={isSelectDisabled}
        >
            <SelectTrigger className="border-none shadow-none">
                {(() => {
                    const item = data.find((item) => item.value === status);
                    return item ? (
                        <item.icon size={16} className={cn(item.text)} />
                    ) : null;
                })()}
                {status}
            </SelectTrigger>
            <SelectContent>
                {data.map((item) => {
                    const isAdminAccessible = item.accessibleTo?.includes(
                        role ?? ''
                    );
                    const isUserAllowedOption =
                        isUser &&
                        isDelivered &&
                        ['In Revision', 'Completed'].includes(item.value);

                    const isSelectable =
                        isAdminAccessible || isUserAllowedOption;

                    return (
                        <SelectItem
                            key={item.id}
                            value={item.value}
                            disabled={!isSelectable}
                            className={cn(!isSelectable && 'opacity-50')}
                        >
                            <item.icon
                                size={16}
                                className={cn('w-full', item.text)}
                            />
                            {item.value}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
