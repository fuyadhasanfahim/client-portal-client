import { apiSlice } from '@/redux/api/apiSlice';

export const messagesApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            setMessage: build.mutation({
                query: (data) => ({
                    url: 'messages/set-message',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Messages'],
            }),
            getMessages: build.query({
                query: (conversationID) => ({
                    url: 'messages/get-messages',
                    method: 'GET',
                    params: { conversationID },
                }),
                providesTags: ['Messages'],
            }),
            getConversation: build.query({
                query: (userID) => ({
                    url: 'messages/get-conversation',
                    method: 'GET',
                    params: {
                        userID,
                    },
                }),
                providesTags: ['Messages'],
            }),
        };
    },
});

export const {
    useGetMessagesQuery,
    useSetMessageMutation,
    useGetConversationQuery,
} = messagesApi;
