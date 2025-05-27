export default function getStatusColorClasses(status: string) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-50 text-yellow-500 border-yellow-500';
        case 'in-progress':
            return 'bg-blue-50 text-blue-500 border-blue-500';
        case 'client-review':
            return 'bg-purple-50 text-purple-500 border-purple-500';
        case 'revision-requested':
            return 'bg-pink-50 text-pink-500 border-pink-500';
        case 'completed':
        case 'done':
            return 'bg-green-50 text-green-500 border-green-500';
        case 'cancelled':
            return 'bg-red-50 text-red-500 border-red-500';
        default:
            return 'bg-gray-50 text-gray-500 border-gray-500';
    }
}
