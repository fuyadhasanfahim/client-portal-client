import { z } from 'zod';

export const NewOrderDetailsSchema = z
    .object({
        downloadLink: z
            .string({
                required_error: 'Download link is required',
            })
            .url('Download link must be a valid URL'),
        images: z.coerce
            .number({
                required_error: 'Image count is required',
            })
            .min(1, 'Image count must be at least 1'),
        returnFileFormat: z
            .array(z.string())
            .min(1, 'Return file format is required'),
        backgroundOption: z
            .array(z.string())
            .min(1, 'Background option is required'),
        backgroundColor: z
            .array(z.string())
            .min(1, 'Background color is required'),
        imageResizing: z.boolean().optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        instructions: z
            .string({
                required_error: 'Instructions are required',
            })
            .min(1, 'Instructions are required'),
        sourceFileLink: z.string().optional(),
        deliveryDate: z.date(),
    })
    .superRefine((data, ctx) => {
        if (data.imageResizing) {
            // Now checking the boolean directly
            if (!data.width || data.width <= 0) {
                ctx.addIssue({
                    path: ['width'],
                    code: z.ZodIssueCode.custom,
                    message: 'Width is required when resizing is enabled.',
                });
            }
            if (!data.height || data.height <= 0) {
                ctx.addIssue({
                    path: ['height'],
                    code: z.ZodIssueCode.custom,
                    message: 'Height is required when resizing is enabled.',
                });
            }
        }
    });
