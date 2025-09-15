import { apiSlice } from '@/redux/api/apiSlice';

export const messageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: ({ userID, conversationID, rawLimit, cursor }) => ({
                url: `messages/get-messages`,
                method: 'GET',
                params: { userID, conversationID, rawLimit, cursor },
            }),
            providesTags: ['Messages'],
        }),
        newMessage: builder.mutation({
            query: ({ conversationID, text, senderID }) => ({
                url: `messages/new-message`,
                method: 'POST',
                body: { conversationID, text, senderID },
            }),
            invalidatesTags: ['Messages', 'Conversations'],
        }),
    }),
});

export const { useGetMessagesQuery, useNewMessageMutation } = messageApi;
