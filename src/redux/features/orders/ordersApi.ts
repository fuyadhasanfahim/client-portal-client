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
            newDraftOrder: build.mutation({
                query: (data) => ({
                    url: `orders/new-order`,
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            getDraftOrder: build.query({
                query: ({ id, status }) => ({
                    url: `orders/get-order?id=${id}&status=${status}`,
                    method: 'GET',
                }),
                providesTags: ['Orders'],
            }),
            getOrders: build.query({
                query: ({
                    params: { page, quantity, searchQuery: query },
                }) => ({
                    url: 'orders/get-orders',
                    params: { page, quantity, searchQuery: query },
                }),
                providesTags: ['Orders'],
            }),
            updateOrder: build.mutation({
                query: ({ id, data }) => ({
                    url: `orders/update-order`,
                    method: 'PUT',
                    body: { id, data },
                }),
                invalidatesTags: ['Orders'],
            }),
        };
    },
});

export const {
    useAddOrderMutation,
    useNewDraftOrderMutation,
    useGetDraftOrderQuery,
    useGetOrdersQuery,
    useUpdateOrderMutation,
} = ordersApi;
