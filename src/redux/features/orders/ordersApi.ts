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
                query: ({ data, userID }) => ({
                    url: `orders/drafts/new-draft?user-id=${userID}`,
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Orders'],
            }),
            getDraftOrder: build.query({
                query: (id) => ({
                    url: `orders/drafts/get-draft?id=${id}`,
                    method: 'GET',
                }),
                providesTags: ['Orders'],
            }),
        };
    },
});

export const { useAddOrderMutation, useNewDraftOrderMutation, useGetDraftOrderQuery } = ordersApi;
