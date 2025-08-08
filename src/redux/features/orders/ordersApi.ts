import { apiSlice } from '@/redux/api/apiSlice';

export const ordersApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            newOrder: builder.mutation({
                query: ({
                    orderStage,
                    userID,
                    services,
                    orderID,
                    details,
                    total,
                    payment,
                }) => ({
                    url: `orders/new-order/${orderStage}`,
                    method: 'POST',
                    body: {
                        userID,
                        services,
                        orderID,
                        details,
                        total,
                        payment,
                    },
                }),
                invalidatesTags: ['Orders'],
            }),
            getOrders: builder.query({
                query: (params) => ({
                    url: 'orders/get-orders',
                    params: {
                        ...params,
                        page: params.page || 1,
                        limit: params.limit || 10,
                    },
                }),
                providesTags: ['Orders'],
                transformResponse: (response) => {
                    if (!response.success) {
                        throw new Error('Failed to fetch orders');
                    }
                    return {
                        orders: response.data.orders,
                        pagination: response.data.pagination,
                    };
                },
            }),
            getDraftOrders: builder.query({
                query: (params) => ({
                    url: 'orders/get-draft-orders',
                    params: {
                        ...params,
                        page: params.page || 1,
                        limit: params.limit || 10,
                    },
                }),
                providesTags: ['Orders'],
                transformResponse: (response) => {
                    if (!response.success) {
                        throw new Error('Failed to fetch orders');
                    }
                    return {
                        orders: response.data.orders,
                        pagination: response.data.pagination,
                    };
                },
            }),
            getOrderByID: builder.query({
                query: (orderID) => ({
                    url: `orders/get-orders/${orderID}`,
                    method: 'GET',
                }),
                providesTags: ['Orders'],
            }),
            updateOrder: builder.mutation({
                query: ({ orderID, data }) => ({
                    url: `orders/update-order/${orderID}`,
                    method: 'PUT',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            deliverOrder: builder.mutation({
                query: ({ orderID, downloadLink }) => ({
                    url: 'orders/deliver-order',
                    method: 'PUT',
                    body: { orderID, downloadLink },
                }),
                invalidatesTags: ['Orders'],
            }),
            reviewOrder: builder.mutation({
                query: ({ orderID, instructions }) => ({
                    url: `orders/review-order`,
                    method: 'PUT',
                    body: { orderID, instructions },
                }),
                invalidatesTags: ['Orders'],
            }),
            completeOrder: builder.mutation({
                query: (orderID) => ({
                    url: `orders/complete-order`,
                    method: 'PUT',
                    body: orderID,
                }),
                invalidatesTags: ['Orders'],
            }),
            getOrdersByStatus: builder.query({
                query: ({ userID, role, status }) => ({
                    url: `orders/get-orders-by-status/${status}`,
                    method: 'GET',
                    params: {
                        userID,
                        role,
                    },
                }),
                providesTags: ['Orders'],
            }),
            getOrdersByUserID: builder.query({
                query: ({ userID, search, page, limit, filter, sort }) => ({
                    url: 'orders/get-orders-by-user',
                    method: 'GET',
                    params: {
                        userID,
                        search,
                        page,
                        limit,
                        filter,
                        sort,
                    },
                }),
                providesTags: ['Orders'],
            }),
        };
    },
});

export const {
    useNewOrderMutation,
    useGetOrdersQuery,
    useGetDraftOrdersQuery,
    useGetOrderByIDQuery,
    useUpdateOrderMutation,
    useDeliverOrderMutation,
    useReviewOrderMutation,
    useCompleteOrderMutation,
    useGetOrdersByStatusQuery,
    useGetOrdersByUserIDQuery,
} = ordersApi;
