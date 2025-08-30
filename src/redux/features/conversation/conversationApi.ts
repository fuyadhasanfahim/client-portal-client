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
        /** GET /conversations/get-conversations (admin) */
        getConversations: builder.query<
            { items: ConversationListItem[] },
            { limit?: number; cursor?: string | null }
        >({
            query: ({ limit = 50, cursor = null }) => ({
                url: 'conversations/get-conversations',
                params: { limit, cursor: cursor ?? undefined },
            }),
            // collapse to a single cache entry regardless of args
            serializeQueryArgs: () => 'getConversations',
            transformResponse: (res: { items: ConversationListItem[] }) => res,
            providesTags: ['ConversationList'],
            keepUnusedDataFor: 60,
        }),
    }),
});

export const { useGetConversationsQuery } = conversationApi;
