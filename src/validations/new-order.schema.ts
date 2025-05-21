import { z } from 'zod';

const newOrderServiceSchema = z.object({
    serviceNames: z
        .array(
            z.object({
                name: z.string(),
                price: z.number().optional(),
            })
        )
        .min(1, 'Select at least one service, before going to upload photos.'),
    complexity: z
        .object({
            name: z.string(),
            price: z.number(),
        })
        .optional(),
    types: z.array(
        z.object({
            name: z.string(),
            complexity: z
                .object({
                    name: z.string(),
                    price: z.number(),
                })
                .optional(),
        })
    ),
    options: z.array(
        z.object({
            colorCodes: z.array(z.string()).optional(),
            height: z.number().optional(),
            width: z.number().optional(),
        })
    ),
});

export default newOrderServiceSchema;
