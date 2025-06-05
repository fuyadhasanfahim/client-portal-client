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
            deliverOrder: build.mutation({
                query: ({
                    order_id,
                    order_status,
                    user_id,
                    download_link,
                }) => ({
                    url: `orders/deliver-order`,
                    method: 'PUT',
                    params: { order_id, order_status, user_id, download_link },
                }),
                invalidatesTags: ['Orders'],
            }),
            reviewOrder: build.mutation({
                query: ({ order_id, sender_id, sender_role, message }) => ({
                    url: `orders/review-order`,
                    method: 'PUT',
                    params: { order_id, sender_id, sender_role, message },
                }),
                invalidatesTags: ['Orders'],
            }),
            completeOrder: build.mutation({
                query: ({ order_id, user_id }) => ({
                    url: `orders/complete-order`,
                    method: 'PUT',
                    params: { order_id, user_id },
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
    useDeliverOrderMutation,
    useReviewOrderMutation,
    useCompleteOrderMutation,
} = ordersApi;
