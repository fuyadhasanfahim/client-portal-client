import { apiSlice } from '@/redux/api/apiSlice';

export const revisionsApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getRevisions: build.query({
                query: (order_id) => ({
                    url: 'revisions/get-revisions',
                    params: {
                        order_id,
                    },
                }),
                providesTags: ['Revisions'],
            }),
            newRevision: build.mutation({
                query: (data) => ({
                    url: 'revisions/new-revision',
                    method: 'POST',
                    body: data,
                    invalidatesTags: ['Revisions'],
                }),
            }),
        };
    },
});

export const { useGetRevisionsQuery, useNewRevisionMutation } = revisionsApi;
