import { apiSlice } from '@/redux/api/apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            addOrder: build.mutation({
                query: (data) => ({
                    url: 'orders/add-order',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
        };
    },
});

export const { useAddOrderMutation } = ordersApi;
