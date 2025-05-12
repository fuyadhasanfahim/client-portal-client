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
                complexities: z
                    .array(
                        z.object({
                            label: z.string().nonempty({
                                message: 'Complexity label is required.',
                            }),
                            price: z.number().nonnegative({
                                message: 'Price must be non-negative.',
                            }),
                        })
                    )
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
    userId: z.string().nonempty({ message: 'User ID is required.' }),
    downloadLink: z.string().nonempty({ message: 'User ID is required.' }),
    // OrderCreationDate: z.date({
    //     required_error: 'Order Creation Date is required.',
    // }),
    // driveLink: z.string().nonempty({ message: 'Drive link is required.' }),
    // numberOfImages: z
    //     .number()
    //     .nonnegative({ message: 'Number of images must be non-negative.' }),
    // pricePerImage: z
    //     .number()
    //     .nonnegative({ message: 'Price per image must be non-negative.' }),
    // returnFormate: z
    //     .string()
    //     .nonempty({ message: 'Return format is required.' }),
    // orderInstructions: z
    //     .string()
    //     .nonempty({ message: 'Order instructions are required.' }),
    // images: z.string().optional(),
    // paymentStatus: z
    //     .string()
    //     .nonempty({ message: 'Payment status is required.' }),
    // paymentMethod: z
    //     .string()
    //     .nonempty({ message: 'Payment method is required.' }),
    // totalPrice: z
    //     .number()
    //     .nonnegative({ message: 'Total price must be non-negative.' }),
});
