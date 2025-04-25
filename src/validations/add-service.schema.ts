import { z } from 'zod';

export const addServiceSchema = z.object({
    name: z
        .string()
        .nonempty({ message: 'Name is required and cannot be empty.' }),
    complexities: z
        .array(
            z.object({
                label: z.string().nonempty({
                    message:
                        'Complexity label is required and cannot be empty.',
                }),
                price: z
                    .number()
                    .nonnegative({
                        message: 'Price must be a non-negative number.',
                    })
                    .min(0, 'Price must be 0 or more'),
            })
        )
        .optional(),
});
