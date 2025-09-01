import { apiSlice } from '@/redux/api/apiSlice';

export type ConversationListItem = {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userImage?: string;
    lastMessageAt: string;
    lastMessageText?: string;
    lastMessageAuthorID?: string;
    createdAt?: string;
    updatedAt?: string;
};

export const conversationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (userID) => ({
                url: 'conversations/get-conversations',
                params: { userID },
            }),
            providesTags: ['Conversations'],
        }),
        getConversation: builder.query({
            query: (ConversationID) => ({
                url: `conversations/get-conversation/${ConversationID}`,
            }),
            providesTags: ['Conversations'],
        }),
    }),
});

export const { useGetConversationsQuery, useGetConversationQuery } =
    conversationApi;
