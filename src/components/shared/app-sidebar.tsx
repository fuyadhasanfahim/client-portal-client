'use client';

import * as React from 'react';
import { IconInnerShadowTop } from '@tabler/icons-react';
import { NavMain } from '@/components/shared/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { sidebarItems } from '@/data/sidebar';
import Link from 'next/link';

export function AppSidebar(
    props: React.ComponentProps<typeof Sidebar> & {
        user: {
            name: string;
            email: string;
            profileImage?: string;
            role: string;
        };
    }
) {
    const { user } = props;

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link
                                href={'/dashboard'}
                                className="cursor-pointer flex items-center gap-2 text-xl"
                            >
                                <IconInnerShadowTop className="!size-5" />
                                <span className="font-semibold">
                                    Client Portal
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sidebarItems} role={user?.role} />
            </SidebarContent>
        </Sidebar>
    );
}
