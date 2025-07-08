import { apiSlice } from '@/redux/api/apiSlice';
import { IOrderDetails, IOrderServiceSelection } from '@/types/order.interface';
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
                    payment,
                }: {
                    orderStage: string;
                    userID: string;
                    services?: IOrderServiceSelection[];
                    orderID?: string;
                    details?: IOrderDetails;
                    payment?: IPayment;
                }) => ({
                    url: `orders/new-order/${orderStage}`,
                    method: 'POST',
                    body: {
                        userID,
                        services,
                        orderID,
                        details,
                        payment,
                    },
                }),
            }),
            getOrderByID: builder.query({
                query: (orderID) => ({
                    url: `orders/get-orders/${orderID}`,
                    method: 'GET',
                }),
            }),

            addOrder: builder.mutation({
                query: (data) => ({
                    url: 'orders/add-order',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            // newOrder: builder.mutation({
            //     query: (data) => ({
            //         url: `orders/new-order`,
            //         method: 'POST',
            //         body: data,
            //     }),
            //     invalidatesTags: ['Orders'],
            // }),
            getOrder: builder.query({
                query: (params) => ({
                    url: 'orders/get-order',
                    method: 'GET',
                    params,
                }),
                providesTags: ['Orders'],
            }),
            getOrders: builder.query({
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
            updateOrder: builder.mutation({
                query: ({ orderID, data }) => ({
                    url: `orders/update-order`,
                    method: 'PUT',
                    body: { orderID, data },
                }),
                invalidatesTags: ['Orders'],
            }),
            deliverOrder: builder.mutation({
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
            reviewOrder: builder.mutation({
                query: ({ order_id, sender_id, sender_role, message }) => ({
                    url: `orders/review-order`,
                    method: 'PUT',
                    params: { order_id, sender_id, sender_role, message },
                }),
                invalidatesTags: ['Orders'],
            }),
            completeOrder: builder.mutation({
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
    useNewOrderMutation,
    useGetOrderByIDQuery,
    // fjkdgbsdfg
    useAddOrderMutation,
    useGetOrderQuery,
    useGetOrdersQuery,
    useUpdateOrderMutation,
    useDeliverOrderMutation,
    useReviewOrderMutation,
    useCompleteOrderMutation,
} = ordersApi;
