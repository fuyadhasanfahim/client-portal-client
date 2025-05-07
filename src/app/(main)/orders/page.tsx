import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Metadata } from 'next';
import ServicesDataTable from '@/components/services/ServicesDataTable';
import AddOrderForm from '@/components/orders/AddOrderForm';
import { getUserData } from '@/actions/user.action';

export const metadata: Metadata = {
    title: 'Services | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default async function OrdersPage() {
    const data = await getUserData();

    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Orders Summery
                </h2>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus />
                            Add New Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 min-w-5xl">
                        <ScrollArea className="px-2 max-h-[95vh]">
                            <DialogHeader className="p-4">
                                <DialogTitle>Add Order Form</DialogTitle>
                                <DialogDescription>
                                    Fill all the required fields to add a new
                                    service.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form component */}
                            <AddOrderForm userId={(data?._id).toString()} />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <ServicesDataTable />
        </section>
    );
}
