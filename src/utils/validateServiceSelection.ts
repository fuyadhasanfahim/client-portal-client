import IService from '@/types/service.interface';
import { addOrderSchema } from '@/validations/add-order.schema';
import { z } from 'zod';

export default function validateServiceSelection(
    serviceId: string,
    originalService: IService,
    selectedServices: z.infer<typeof addOrderSchema>['services']
): boolean {
    const selected = selectedServices.find((s) => s._id === serviceId);
    if (!selected) return false;

    const needsComplexity =
        !originalService.price &&
        (originalService.complexities?.length ?? 0) > 0;

    const needsTypes = (originalService.types?.length ?? 0) > 0;
    const hasSelectedTypes = (selected.types?.length ?? 0) > 0;
    const hasSelectedComplexity = (selected.complexities?.length ?? 0) > 0;

    const requiresColorCode = selected.types?.some(
        (t) => t.title === 'Custom Color'
    );
    const hasColorCode = !!selected.colorCode?.trim();

    if (needsTypes && !hasSelectedTypes) return false;
    if (needsComplexity && !hasSelectedComplexity) return false;
    if (requiresColorCode && !hasColorCode) return false;

    return true;
}
