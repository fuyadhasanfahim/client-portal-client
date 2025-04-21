'use client'

import { useSession } from "next-auth/react";

export default function Page() {
    const { data: session } = useSession();

    console.log('Session:', session);
    return (
        <div></div>
    );
}