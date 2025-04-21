'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { breadcrumbs } from '@/data/header';

export function SiteHeader() {
    const pathname = usePathname();
    const key = pathname.split('/').filter(Boolean).join('-');

    const currentBreadcrumbs = breadcrumbs[key] || [];

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {currentBreadcrumbs.map((item, index) => (
                            <BreadcrumbItem key={index}>
                                {index < currentBreadcrumbs.length - 1 ? (
                                    <>
                                        <BreadcrumbLink href={item.href}>
                                            {item.title}
                                        </BreadcrumbLink>
                                        <BreadcrumbSeparator />
                                    </>
                                ) : (
                                    <BreadcrumbPage>
                                        {item.title}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
