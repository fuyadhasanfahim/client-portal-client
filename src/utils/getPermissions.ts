import { ISanitizedUser } from '@/types/user.interface';

export function getTeamPermissions(userData: ISanitizedUser) {
    return {
        viewPrices: userData?.teamPermissions?.viewPrices ?? false,
        createOrders: userData?.teamPermissions?.createOrders ?? false,
        exportInvoices: userData?.teamPermissions?.exportInvoices ?? false,
    };
}

export function getEffectivePermissions(userData: ISanitizedUser) {
    if (!userData) return undefined;

    if (userData.isTeamMember) {
        return getTeamPermissions(userData);
    }

    return undefined;
}
