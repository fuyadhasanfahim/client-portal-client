'use client';

import { type Icon } from '@tabler/icons-react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function NavMain({
    items,
    role,
}: {
    items: {
        title: string;
        url: string;
        icon?: Icon;
        access: string[];
    }[];
    role: string;
}) {
    const pathname = usePathname();

    const filteredItems = items.filter((item) => item.access.includes(role));

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <Link href={'/orders/new-order'}>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="hover:bg-primary/90 hover:text-white transition-colors duration-200 ease-in"
                                asChild
                                tooltip={'New Order'}
                            >
                                <Button>
                                    <PlusIcon />
                                    New Order
                                </Button>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Link>
                    <Link href={'/quotes/new-quote'}>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="border text-black"
                                asChild
                                variant={'outline'}
                                tooltip={'New Quote'}
                            >
                                <Button>
                                    <PlusIcon />
                                    New Quote
                                </Button>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Link>
                </SidebarMenu>

                <SidebarMenu>
                    {filteredItems.map((item) => (
                        <Link key={item.title} href={item.url}>
                            <SidebarMenuItem
                                className={cn(
                                    'rounded-md',
                                    pathname.startsWith(item.url) &&
                                        'bg-green-100'
                                )}
                            >
                                <SidebarMenuButton
                                    className="cursor-pointer text-gray-600 font-semibold hover:text-gray-600 hover:bg-green-50"
                                    tooltip={item.title}
                                >
                                    {item.icon && <item.icon className="" />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </Link>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
