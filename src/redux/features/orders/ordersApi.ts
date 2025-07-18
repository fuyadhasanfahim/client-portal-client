import { apiSlice } from '@/redux/api/apiSlice';
import {
    IOrder,
    IOrderDetails,
    IOrderServiceSelection,
} from '@/types/order.interface';
import { IPayment } from '@/types/payment.interface';

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
                }: {
                    orderStage: string;
                    userID?: string;
                    services?: IOrderServiceSelection[];
                    orderID?: string;
                    details?: IOrderDetails;
                    total?: number;
                    payment?: IPayment;
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
        };
    },
});

export const {
    useNewOrderMutation,
    useGetOrdersQuery,
    useGetOrderByIDQuery,
    useUpdateOrderMutation,
    useDeliverOrderMutation,
    useReviewOrderMutation,
    useCompleteOrderMutation,
    useGetOrdersByStatusQuery,
} = ordersApi;
