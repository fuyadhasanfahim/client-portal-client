import { apiSlice } from '@/redux/api/apiSlice';

export const stripeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSetupIntent: builder.mutation({
            query: ({ userID, orderID }) => ({
                url: 'stripe/create-setup-intent',
                method: 'POST',
                body: { userID, orderID },
            }),
        }),
        newOrderCheckout: builder.mutation({
            query: ({ orderID, paymentOption, paymentMethod }) => ({
                url: 'stripe/new-order-checkout',
                method: 'POST',
                body: { orderID, paymentOption, paymentMethod },
            }),
        }),
    }),
});

export const { useCreateSetupIntentMutation, useNewOrderCheckoutMutation } =
    stripeApi;
