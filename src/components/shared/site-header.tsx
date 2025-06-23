'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import React from 'react';

export function SiteHeader({
    user,
}: {
    user: {
        name: string;
        email: string;
        profileImage?: string;
    };
}) {
    return (
        <header className="flex h-16 shrink-0 px-4 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4 h-5">
                    <SidebarTrigger />
                </div>
                <div>
                    <NavUser user={user} />
                </div>
            </div>
        </header>
    );
}
