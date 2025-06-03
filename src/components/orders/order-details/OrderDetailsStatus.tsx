import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { IconTool } from '@tabler/icons-react';

export default function OrderDetailsStatus({
    status,
    user,
}: {
    status: string;
    user: {
        userID: string;
        name: string;
        role: string;
    };
}) {
    const isCustomer = user.role === 'User';

    const getStatusCard = () => {
        switch (status) {
            case 'In Revision':
                return {
                    color: 'yellow',
                    title: isCustomer
                        ? 'Your order is under revision'
                        : 'Order marked as "In Revision"',
                    message: isCustomer
                        ? 'Our team is working on the requested changes.'
                        : `You marked the order for revision. Awaiting updated submission.`,
                };
            case 'In Progress':
                return {
                    color: 'blue',
                    title: isCustomer
                        ? 'Your order is in progress'
                        : 'Order marked as "In Progress"',
                    message: isCustomer
                        ? 'Our team is currently working on your order.'
                        : `You marked the order as in progress. It's currently being worked on.`,
                };
            case 'Completed':
                return {
                    color: 'green',
                    title: isCustomer
                        ? 'Your order is completed'
                        : 'Order marked as "Completed"',
                    message: isCustomer
                        ? 'The final version has been delivered.'
                        : `You marked this order as completed.`,
                };
            case 'Pending':
                return {
                    color: 'yellow',
                    title: isCustomer
                        ? 'Your order is pending'
                        : 'Order is pending',
                    message: isCustomer
                        ? 'We’ve received your request. Processing will start soon.'
                        : `You’ve created a pending order. Awaiting further action.`,
                };
            default:
                return null;
        }
    };

    const statusCard = getStatusCard();

    if (!statusCard) return null;

    const { color, title, message } = statusCard;

    return (
        <Card className={`bg-${color}-50 border-l-4 border-${color}-500`}>
            <CardContent>
                <CardTitle
                    className={`text-${color}-800 text-2xl flex items-center gap-2`}
                >
                    <IconTool size={24} />
                    <span>{title}</span>
                </CardTitle>
                <p className={`text-sm text-${color}-700`}>{message}</p>
            </CardContent>
        </Card>
    );
}
