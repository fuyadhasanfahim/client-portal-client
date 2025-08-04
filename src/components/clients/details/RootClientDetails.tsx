'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailsOrders from './DetailsOrders';
import DetailsQuotes from './DetailsQuotes';
import DetailsOverview from './DetailsOverview';

export default function RootClientDetails({ userID }: { userID: string }) {
    return (
        <section className="space-y-4">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="quotes">Quotes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <DetailsOverview userID={userID} />
                </TabsContent>
                <TabsContent value="orders">
                    <DetailsOrders userID={userID} />
                </TabsContent>
                <TabsContent value="quotes">
                    <DetailsQuotes userID={userID} />
                </TabsContent>
            </Tabs>
        </section>
    );
}
