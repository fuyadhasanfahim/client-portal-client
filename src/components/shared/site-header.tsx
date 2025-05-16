'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { Separator } from '../ui/separator';
import { usePathname } from 'next/navigation';
import { SiteHeaders } from '@/data/header';

export function SiteHeader({
    user,
}: {
    user: {
        name: string;
        email: string;
        profileImage?: string;
    };
}) {
    const pathname = usePathname();

    return (
        <header className="flex h-16 shrink-0 px-4 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4 h-5">
                    <SidebarTrigger />
                    <Separator orientation="vertical" />
                    <h3 className="text-lg font-semibold">
                        {SiteHeaders.find((s) => s.href === pathname)?.title ??
                            ''}
                    </h3>
                </div>
                <div>
                    <NavUser user={user} />
                </div>
            </div>
        </header>
    );
}
