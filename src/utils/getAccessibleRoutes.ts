import {
    sidebarItems,
    type SidebarItem,
    type TeamPermKey,
} from '@/data/sidebar';

export type TeamPermissions = Partial<Record<TeamPermKey, boolean>>;

function matchRoute(pathname: string) {
    return sidebarItems.find(
        (item) =>
            pathname.startsWith(item.url) ||
            pathname === item.url ||
            (item.url.includes('[id]') &&
                pathname.startsWith(item.url.replace('/[id]', '')))
    );
}

function teamPermsOk(
    item: SidebarItem,
    ownerUserID?: string | null,
    perms?: TeamPermissions,
    role?: 'admin' | 'user'
): boolean {
    if (role === 'admin') return true;

    if (!ownerUserID) return true;

    if (item.hideForTeamMember) return false;

    if (!item.requireTeamPerm) return true;

    const required = Array.isArray(item.requireTeamPerm)
        ? item.requireTeamPerm
        : [item.requireTeamPerm];

    return required.every((k) => !!perms?.[k]);
}

export default async function getAccessibleRoutes({
    pathname,
    role,
    ownerUserID,
    permissions,
}: {
    pathname: string;
    role: 'admin' | 'user';
    ownerUserID?: string | null;
    permissions?: TeamPermissions | undefined;
}) {
    try {
        const item = matchRoute(pathname);

        if (!item) return true;

        if (!item.access.includes(role)) return false;

        return teamPermsOk(item, ownerUserID, permissions, role);
    } catch (error) {
        console.error('Error checking route access:', error);
        return false;
    }
}
