import { apiSlice } from '@/redux/api/apiSlice';

export const paymentsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        newPayment: builder.mutation({
            query: ({
                userID,
                orderID,
                paymentOption,
                paymentIntentID,
                customerID,
                status,
            }) => ({
                url: 'payments/new-payment',
                method: 'POST',
                body: {
                    userID,
                    orderID,
                    paymentOption,
                    paymentIntentID,
                    customerID,
                    status,
                },
            }),
        }),
        getPaymentsByStatus: builder.query({
            query: ({ status, paymentOption, userID, role }) => ({
                url: `payments/get-payments-amount/${status}`,
                method: 'GET',
                params: { userID, role, paymentOption },
            }),
        }),
    }),
});

export const { useNewPaymentMutation, useGetPaymentsByStatusQuery } =
    paymentsApi;
