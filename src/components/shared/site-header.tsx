'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { Separator } from '../ui/separator';
import { usePathname } from 'next/navigation';
import { SiteHeaders } from '@/data/header';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
    const pathname = usePathname();

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments
        .map((_, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/');
            const header = SiteHeaders.find((item) =>
                item.match ? item.match.test(href) : item.href === href
            );

            if (header) {
                return {
                    href,
                    title: header.title.split('/').at(-1)?.trim(),
                };
            }

            const segment = segments[index];
            const isObjectId = /^[a-f\d]{24}$/i.test(segment);
            if (isObjectId) return null;

            return {
                href,
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
            };
        })
        .filter(Boolean);

    return (
        <header className="flex h-16 shrink-0 px-4 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4 h-5">
                    <SidebarTrigger />
                    <Separator orientation="vertical" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb?.href}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {index === breadcrumbs.length - 1 ? (
                                            <BreadcrumbPage>
                                                {crumb?.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb?.href}>
                                                {crumb?.title}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div>
                    <NavUser user={user} />
                </div>
            </div>
        </header>
    );
}
