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
                    {filteredItems.map((item) => (
                        <Link key={item.title} href={item.url}>
                            <SidebarMenuItem
                                className={cn(
                                    'rounded-md',
                                    pathname.startsWith(item.url) &&
                                        'bg-stone-200'
                                )}
                            >
                                <SidebarMenuButton
                                    className="cursor-pointer"
                                    tooltip={item.title}
                                >
                                    {item.icon && <item.icon />}
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
