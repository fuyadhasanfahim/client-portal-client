import { z } from 'zod';

export const NewOrderDetailsSchema = z
    .object({
        downloadLink: z.string().url(),
        images: z.coerce.number().min(1, 'Image count is required'),
        returnFileFormat: z.string().min(1),
        backgroundOption: z.string().min(1),
        imageResizing: z.enum(['Yes', 'No']),
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        instructions: z.string().min(1),
        supportingFileDownloadLink: z.string().url().optional(),
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
