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
            .string({
                required_error: 'Return file format is required',
            })
            .min(1, 'Return file format is required'),
        backgroundOption: z
            .string({
                required_error: 'Background option is required',
            })
            .min(1, 'Background option is required'),
        imageResizing: z.enum(['Yes', 'No']).optional(),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        instructions: z
            .string({
                required_error: 'Instructions are required',
            })
            .min(1, 'Instructions are required'),
        supportingFileDownloadLink: z.string().optional(),
        deliveryDate: z.date(),
    })
    .superRefine((data, ctx) => {
        if (data.imageResizing === 'Yes') {
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
