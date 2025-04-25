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
import AddServiceForm from '@/components/services/AddServiceForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Services | Client Portal',
    description:
        'Welcome to the Client Portal – your gateway to seamless business management and collaboration.',
};

export default function ServicesPage() {
    return (
        <section>
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Active Services
                </h2>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus />
                            Add New Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="px-0 min-w-4xl">
                        <ScrollArea className="px-2 max-h-[80vh]">
                            <DialogHeader className="p-4">
                                <DialogTitle>Add Service Form</DialogTitle>
                                <DialogDescription>
                                    Fill all the required fields to add a new
                                    service.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form component */}
                            <AddServiceForm />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
