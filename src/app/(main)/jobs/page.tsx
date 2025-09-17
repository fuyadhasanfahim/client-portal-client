import JobTable from '@/components/job/JobTable';
import { Button } from '@/components/ui/button';
import { Sheet } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Jobs | Client Portal',
};

export default function JobPage() {
    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    All listed job
                </h2>

                <Link href={'/jobs/applicants'}>
                    <Button>
                        <Sheet />
                        View Applications
                    </Button>
                </Link>
            </div>
            <JobTable />
        </section>
    );
}
