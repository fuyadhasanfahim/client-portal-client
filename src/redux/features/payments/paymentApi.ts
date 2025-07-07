import { apiSlice } from '@/redux/api/apiSlice';

export const paymentsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaymentsByStatus: builder.query({
            query: ({ status, paymentOption, userID, role }) => ({
                url: `payments/get-payments-amount/${status}`,
                method: 'GET',
                params: { userID, role, paymentOption },
            }),
        }),
    }),
});

export const { useGetPaymentsByStatusQuery } = paymentsApi;
