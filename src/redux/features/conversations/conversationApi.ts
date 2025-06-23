import { apiSlice } from '@/redux/api/apiSlice';

export const conversationsApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            getConversations: builder.query({
                query: (email) =>
                    `conversations/get-conversations?email=${email}`,
            }),
        };
    },
});

export const { useGetConversationsQuery } = conversationsApi;
