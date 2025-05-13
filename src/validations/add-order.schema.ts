import { z } from 'zod';

export const addOrderSchema = z.object({
    services: z
        .array(
            z.object({
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
            })
        )
        .min(1, { message: 'Please select at least one service' }),
    width: z.number().optional(),
    height: z.number().optional(),
    userId: z.string().nonempty({ message: 'User ID is required.' }),
    downloadLink: z.string().nonempty({ message: 'User ID is required.' }),
    date: z.date({
        required_error: 'Order Creation Date is required.',
    }),
    numberOfImages: z
        .number()
        .nonnegative({ message: 'Number of images must be non-negative.' }),
    price: z.number().nonnegative({ message: 'Price must be non-negative.' }),
    totalPrice: z
        .number()
        .nonnegative({ message: 'Price must be non-negative.' }),
    returnFormate: z
        .string()
        .nonempty({ message: 'Return format is required.' }),
    instructions: z
        .string()
        .nonempty({ message: 'Order instructions are required.' }),
    paymentOption: z.string().nonempty(),
    paymentMethod: z.string().nonempty(),
    isPaymentCompleted: z.boolean(),
});
