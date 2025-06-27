import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function Dashboard() {
    return <div>This is dashboard page.</div>;
}
