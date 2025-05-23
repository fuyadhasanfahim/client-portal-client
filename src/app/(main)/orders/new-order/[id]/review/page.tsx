import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Review Order | Client Portal',
};

export default function NewOrderReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <>{params.id}</>;
}
