import { z } from 'zod';

const complexitySchema = z.object({
    label: z.string().nonempty({
        message: 'Complexity label is required and cannot be empty.',
    }),
    price: z.number().nonnegative({
        message: 'Complexity price must be a non-negative number.',
    }),
});

export const addServiceSchema = z
    .object({
        name: z.string().nonempty({
            message: 'Name is required and cannot be empty.',
        }),
        price: z.number().nonnegative().optional(),
        complexities: z.array(complexitySchema).optional(),
        accessibleTo: z.enum(['All', 'Custom']),
        accessList: z.array(z.string()).optional(),
        status: z.enum(['Active', 'Inactive', 'Pending']).optional(),
    })
    .refine(
        (data) => {
            const hasComplexities =
                data.complexities && data.complexities.length > 0;
            const hasPrice = typeof data.price === 'number';
            return hasComplexities || hasPrice;
        },
        {
            message:
                'Either price or at least one complexity must be provided.',
            path: ['price'],
        }
    )
    .refine(
        (data) => {
            if (data.accessibleTo === 'Custom') {
                return data.accessList && data.accessList.length > 0;
            }
            return true;
        },
        {
            message: 'Access list is required when Accessible To is Custom.',
            path: ['accessList'],
        }
    );
