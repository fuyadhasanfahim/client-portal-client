'use client';

import { Link, Loader, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import QuoteDataTable from './QuoteDataTable';
import { useSession } from 'next-auth/react';

export default function RootQuotes() {
    const { data: session } = useSession();
    const user = session?.user;

    if (!user) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader className="animate-spin" />
            </div>
        );
    }
    if (!user.role || !user.id) {
        return <div className="text-center">User role or ID not found.</div>;
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Orders Summery
                </h2>

                <Link href={'/quotes/new-quote'}>
                    <Button>
                        <Plus />
                        New Quote
                    </Button>
                </Link>
            </div>

            <QuoteDataTable role={user.role} id={user.id} />
        </section>
    );
}
