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
            newOrder: build.mutation({
                query: (data) => ({
                    url: `orders/new-order`,
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            getOrder: build.query({
                query: (params) => ({
                    url: 'orders/get-order',
                    method: 'GET',
                    params,
                }),
                providesTags: ['Orders'],
            }),
            getOrders: build.query({
                query: ({
                    params: {
                        page,
                        quantity,
                        searchQuery,
                        user_id,
                        user_role,
                        filter,
                    },
                }) => ({
                    url: 'orders/get-orders',
                    params: {
                        page,
                        quantity,
                        searchQuery,
                        user_id,
                        user_role,
                        filter,
                    },
                }),
                providesTags: ['Orders'],
            }),
            updateOrder: build.mutation({
                query: ({ orderID, data }) => ({
                    url: `orders/update-order`,
                    method: 'PUT',
                    body: { orderID, data },
                }),
                invalidatesTags: ['Orders'],
            }),
        };
    },
});

export const {
    useAddOrderMutation,
    useNewOrderMutation,
    useGetOrderQuery,
    useGetOrdersQuery,
    useUpdateOrderMutation,
} = ordersApi;
