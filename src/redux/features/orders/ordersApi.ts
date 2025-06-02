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
            getOrder: build.query({
                query: ({ id, orderStatus, status }) => {
                    const params = new URLSearchParams();

                    if (id) params.append('id', id);
                    if (orderStatus) params.append('order-status', orderStatus);
                    if (status) params.append('status', status);

                    return {
                        url: `orders/get-order?${params.toString()}`,
                        method: 'GET',
                    };
                },
                providesTags: ['Orders'],
            }),
            getOrders: build.query({
                query: ({
                    params: {
                        page,
                        quantity,
                        searchQuery: query,
                        user_id,
                        user_role,
                        filter,
                    },
                }) => ({
                    url: 'orders/get-orders',
                    params: {
                        page,
                        quantity,
                        searchQuery: query,
                        user_id,
                        user_role,
                        filter,
                    },
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
    useGetOrderQuery,
    useGetOrdersQuery,
    useUpdateOrderMutation,
} = ordersApi;
