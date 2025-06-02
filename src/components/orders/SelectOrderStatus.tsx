import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { Icon } from '@tabler/icons-react';

export default function SelectOrderStatus({
    data,
    status,
    handleOrderStatusChange,
    isStatusUpdating,
    id,
    disabled,
}: {
    data: {
        id: string;
        value: string;
        icon: Icon;
        text: string;
        border: string;
        bg: string;
    }[];
    status: string;
    handleOrderStatusChange: (params: {
        id: string;
        data: { orderStatus: string };
    }) => void;
    isStatusUpdating?: boolean;
    id: string;
    disabled?: boolean;
}) {
    const item = data.find((item) => item.value === status);

    return (
        <Select
            value={status}
            onValueChange={(newStatus) =>
                handleOrderStatusChange({
                    id,
                    data: { orderStatus: newStatus },
                })
            }
            disabled={isStatusUpdating || disabled}
        >
            <SelectTrigger
                className={cn(item && item.border, item && item.bg)}
                size="sm"
            >
                {(() => {
                    return item ? (
                        <item.icon size={16} className={cn(item.text)} />
                    ) : null;
                })()}
                {status}
            </SelectTrigger>
            <SelectContent>
                {data.map((item) => {
                    return (
                        <SelectItem key={item.id} value={item.value}>
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
