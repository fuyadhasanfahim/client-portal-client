import { z } from 'zod';

const serviceItemSchema = z
    .object({
        _id: z.string().optional(),
        name: z.string().nonempty({
            message: 'Name is required and cannot be empty.',
        }),
        price: z.number().nonnegative().optional(),
        complexity: z
            .object({
                label: z.string().nonempty(),
                price: z.number().nonnegative(),
            })
            .optional(),
        types: z
            .array(
                z.object({
                    title: z.string().nonempty({
                        message: 'Type title is required.',
                    }),
                })
            )
            .optional(),
        colorCode: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
    })
    .refine(
        (s) =>
            s.name !== 'Image Resizing' ||
            (typeof s.width === 'number' &&
                s.width > 0 &&
                typeof s.height === 'number' &&
                s.height > 0),
        {
            message:
                'Width and height are required for Image Resizing service.',
            path: ['width', 'height'],
        }
    );

export const addOrderSchema = z.object({
    services: z
        .array(serviceItemSchema)
        .min(1, { message: 'Please select at least one service' })
        .refine(
            (services) =>
                services.every(
                    (s) =>
                        !s.types?.some((t) => t.title === 'Custom Color') ||
                        (s.colorCode && s.colorCode.trim().length > 0)
                ),
            {
                message:
                    'Color code is required when "Custom Color" is selected.',
            }
        ),
    userId: z.string().nonempty({ message: 'User ID is required.' }),
    orderId: z.string().nonempty({ message: 'Order ID is required.' }),
    downloadLink: z
        .string()
        .nonempty({ message: 'Download link is required.' }),
    date: z.string(),
    numberOfImages: z
        .number()
        .nonnegative({ message: 'Number of images must be non-negative.' }),
    price: z.number().nonnegative({ message: 'Price must be non-negative.' }),
    returnFormate: z
        .string()
        .nonempty({ message: 'Return format is required.' }),
    instructions: z
        .string()
        .nonempty({ message: 'Order instructions are required.' }),
    paymentOption: z.string().nonempty(),
    paymentMethod: z.string().optional(),
});
