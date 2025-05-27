import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { Icon } from '@tabler/icons-react';
import getStatusColorClasses from '@/utils/getStatusColorClasses';

export default function SelectStatus({
    data,
    status,
    handleUpdateStatus,
    isStatusUpdating,
    id,
}: {
    data: {
        id: string;
        title: string;
        value: string;
        icon: Icon;
    }[];
    status: string;
    handleUpdateStatus: (params: {
        id: string;
        data: { status: string };
    }) => void;
    isStatusUpdating?: boolean;
    id: string;
}) {
    return (
        <Select
            value={status}
            onValueChange={(newStatus) =>
                handleUpdateStatus({
                    id,
                    data: { status: newStatus },
                })
            }
            disabled={isStatusUpdating}
        >
            <SelectTrigger className="border-none shadow-none">
                <Badge
                    variant="outline"
                    className={cn(
                        'capitalize gap-1',
                        getStatusColorClasses(status)
                    )}
                >
                    {(() => {
                        const item = data.find((item) => item.value === status);
                        return item ? (
                            <item.icon
                                size={16}
                                className={cn(getStatusColorClasses(status))}
                            />
                        ) : null;
                    })()}
                    {status}
                </Badge>
            </SelectTrigger>
            <SelectContent>
                {data.map((status, index) => (
                    <SelectItem key={index} value={status.value}>
                        <Badge
                            variant="outline"
                            className={
                                (cn('gap-1'),
                                getStatusColorClasses(status.value))
                            }
                        >
                            {(() => {
                                const item = data.find(
                                    (item) => item.value === status.value
                                );
                                return item ? (
                                    <item.icon
                                        size={16}
                                        className={cn(
                                            'w-full',
                                            getStatusColorClasses(status.value)
                                        )}
                                    />
                                ) : null;
                            })()}
                            {status.title}
                        </Badge>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
