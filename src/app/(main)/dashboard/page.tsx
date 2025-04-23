import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DataTable } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';
import data from './data.json';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function Dashboard() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 md:gap-6">
                    <SectionCards />
                    <div className="">
                        <ChartAreaInteractive />
                    </div>
                    <DataTable data={data} />
                </div>
            </div>
        </div>
    );
}
