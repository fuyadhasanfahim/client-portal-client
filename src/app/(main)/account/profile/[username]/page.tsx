'use client';

import { useParams } from 'next/navigation';

export default function Page() {
    const { username } = useParams();
    return <div>{username}</div>;
}
