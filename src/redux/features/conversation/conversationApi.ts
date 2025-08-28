import { apiSlice } from '@/redux/api/apiSlice';

export type Participant = {
    userID: string;
    name: string;
    email: string;
    image?: string;
    isOnline: boolean;
    lastSeenAt?: string;
    role?: string;
};

export type Conversation = {
    _id: string;
    participants: Participant[];
    lastMessageAt: string;
    unread?: number;
    lastMessageText?: string;
    lastMessageAuthorId?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ConversationPage = {
    items: Conversation[];
    nextCursor?: string;
    hasMore: boolean;
    __arg?: { userID: string; limit?: number; cursor?: string | null };
};

function dedupeById<T extends { _id: string }>(arr: T[]): T[] {
    const seen = new Set<string>();
    const res: T[] = [];
    for (const x of arr) {
        if (!seen.has(x._id)) {
            seen.add(x._id);
            res.push(x);
        }
    }
    return res;
}

export const conversationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<
            ConversationPage,
            { userID: string; limit?: number; cursor?: string | null }
        >({
            query: ({ userID, limit = 20, cursor = null }) => ({
                url: 'conversations/get-conversations',
                params: { userID, limit, cursor: cursor ?? undefined },
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}-${queryArgs.userID}`,
            transformResponse: (
                resp: { ok: boolean } & ConversationPage,
                _meta,
                arg
            ) => ({
                items: resp.items ?? [],
                nextCursor: resp.nextCursor,
                hasMore: !!resp.hasMore,
                __arg: arg,
            }),
            merge: (currentCache, incoming) => {
                const wasCursorRequest = !!incoming.__arg?.cursor;
                if (!wasCursorRequest) {
                    currentCache.items = dedupeById(incoming.items);
                    currentCache.nextCursor = incoming.nextCursor;
                    currentCache.hasMore = incoming.hasMore;
                    return;
                }
                currentCache.items = dedupeById([
                    ...(currentCache.items || []),
                    ...(incoming.items || []),
                ]);
                currentCache.nextCursor = incoming.nextCursor;
                currentCache.hasMore = incoming.hasMore;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
            providesTags: (_result, _err, arg) => [
                { type: 'ConversationList' as const, id: arg.userID },
            ],
            keepUnusedDataFor: 120,
        }),
    }),
});

export const { useGetConversationsQuery, useLazyGetConversationsQuery } =
    conversationApi;
