import { apiSlice } from '@/redux/api/apiSlice';

export type Message = {
    _id: string;
    conversationID: string; // matches your schema field names
    authorID: string;
    authorRole?: 'user' | 'admin';
    text: string;
    sentAt: string;
    createdAt?: string;
    updatedAt?: string;
};

export type MessagesCache = { items: Message[]; nextCursor: string | null };

function dedupe<T extends { _id: string }>(xs: T[]) {
    const m = new Map<string, T>();
    xs.forEach((x) => m.set(x._id, x));
    return Array.from(m.values());
}

export const messageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /** GET /messages/get-messages?conversationID=&limit=&cursor= */
        getMessages: builder.query<
            MessagesCache,
            { conversationID: string; limit?: number; cursor?: string | null }
        >({
            query: ({ conversationID, limit = 20, cursor = null }) => ({
                url: 'messages/get-messages',
                params: { conversationID, limit, cursor: cursor ?? undefined },
            }),
            // one cache per conversation
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}-${queryArgs.conversationID}`,
            transformResponse: (res: {
                messages: Message[];
                nextCursor: string | null;
            }): MessagesCache => ({
                items: res.messages ?? [],
                nextCursor: res.nextCursor ?? null,
            }),
            // merge pages (append newer/older as needed)
            merge: (cache, incoming) => {
                cache.items = dedupe([
                    ...(cache.items || []),
                    ...(incoming.items || []),
                ]);
                cache.nextCursor = incoming.nextCursor;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
            providesTags: (r, e, a) => [
                { type: 'MessageList' as const, id: a.conversationID },
            ],
            keepUnusedDataFor: 60,
        }),

        /** POST /messages/new-messages { conversationId, text } */
        sendMessage: builder.mutation<
            { message: Message },
            { conversationID: string; text: string }
        >({
            query: ({ conversationID, text }) => ({
                url: 'messages/new-messages',
                method: 'POST',
                body: { conversationId: conversationID, text },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                // optimistic append to the "base" cache (cursor=null)
                const patch = dispatch(
                    messageApi.util.updateQueryData(
                        'getMessages',
                        {
                            conversationID: arg.conversationID,
                            limit: 20,
                            cursor: null,
                        },
                        (draft) => {
                            draft.items.push({
                                _id: `temp-${Date.now()}`,
                                conversationID: arg.conversationID,
                                authorID: 'me', // will be replaced by server
                                text: arg.text,
                                sentAt: new Date().toISOString(),
                            });
                        }
                    )
                );
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        messageApi.util.updateQueryData(
                            'getMessages',
                            {
                                conversationID: arg.conversationID,
                                limit: 20,
                                cursor: null,
                            },
                            (draft) => {
                                const idx = draft.items.findIndex(
                                    (m) =>
                                        m._id.startsWith('temp-') &&
                                        m.text === arg.text
                                );
                                if (idx !== -1) draft.items[idx] = data.message;
                            }
                        )
                    );
                } catch {
                    patch.undo();
                }
            },
            invalidatesTags: (r, e, a) => [
                { type: 'MessageList' as const, id: a.conversationID },
            ],
        }),
    }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = messageApi;
