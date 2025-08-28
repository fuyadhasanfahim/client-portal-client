import { apiSlice } from '@/redux/api/apiSlice';

/** ====== Minimal client-side types (adjust to your shared types if you have them) ====== */
export type Attachment = {
    url: string;
    mimeType: string;
    name?: string;
    sizeBytes?: number;
    width?: number;
    height?: number;
    durationSec?: number;
    thumbnailUrl?: string;
    uploadedAt: string | Date;
};

export type Message = {
    _id: string;
    conversationID: string;
    authorId: string;
    text?: string;
    sentAt: string;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    attachments?: Attachment[];
    replyToId?: string;
    editedAt?: string;
    deletedAt?: string;
    reactions?: { emoji: string; userId: string }[];
    readBy?: Record<string, string>; // userID -> ISO date
    createdAt?: string;
    updatedAt?: string;
};

export type MessagesPage = {
    items: Message[];
    nextCursor?: string;
    hasMore: boolean;
    // internal: we carry the arg so "merge" can know if this was a cursor page
    __arg?: {
        conversationID: string;
        limit?: number;
        cursor?: string | null | undefined;
    };
};

function dedupeById<T extends { _id: string }>(arr: T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of arr) {
        if (!seen.has(item._id)) {
            seen.add(item._id);
            out.push(item);
        }
    }
    return out;
}

export const messageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /** GET /get-messages?conversationID=&limit=&cursor=  (cursor = older) */
        getMessages: builder.query<
            MessagesPage,
            { conversationID: string; limit?: number; cursor?: string | null }
        >({
            query: ({ conversationID, limit = 20, cursor = null }) => ({
                url: 'messages/get-messages',
                params: { conversationID, limit, cursor: cursor ?? undefined },
            }),
            // collapse cache key to per-conversation, so pages merge
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}-${queryArgs.conversationID}`,
            transformResponse: (
                resp: { ok: boolean } & MessagesPage,
                _meta,
                arg
            ) => ({
                items: resp.items ?? [],
                nextCursor: resp.nextCursor,
                hasMore: !!resp.hasMore,
                __arg: arg, // <- lets merge know if this call used a cursor
            }),
            merge: (currentCache, incoming) => {
                // If no cursor in the request, replace (fresh first page)
                const wasCursorRequest = !!incoming.__arg?.cursor;
                if (!wasCursorRequest) {
                    currentCache.items = dedupeById(incoming.items);
                    currentCache.nextCursor = incoming.nextCursor;
                    currentCache.hasMore = incoming.hasMore;
                    return;
                }
                // Cursor request: prepend older items (we keep ASC order in cache)
                const combined = dedupeById([
                    ...(incoming.items || []),
                    ...(currentCache.items || []),
                ]);
                currentCache.items = combined;
                currentCache.nextCursor = incoming.nextCursor;
                currentCache.hasMore = incoming.hasMore;
            },
            // only refetch when cursor arg changes
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.cursor !== previousArg?.cursor,
            providesTags: (result, _err, arg) => [
                { type: 'MessageList' as const, id: arg.conversationID },
            ],
            keepUnusedDataFor: 60, // seconds
        }),

        /** POST /new-message */
        sendMessage: builder.mutation<
            { ok: boolean; message: Message },
            {
                conversationID: string;
                authorId: string;
                text?: string;
                attachments?: Attachment[];
                replyToId?: string;
            }
        >({
            query: (body) => ({
                url: 'messages/new-message',
                method: 'POST',
                body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                // Optimistic: append to end (newest) of list
                const patch = dispatch(
                    messageApi.util.updateQueryData(
                        'getMessages',
                        {
                            conversationID: arg.conversationID,
                            limit: 20,
                            cursor: null,
                        },
                        (draft) => {
                            if (!draft.items) draft.items = [];
                            const temp: Message = {
                                _id: `temp-${Date.now()}`,
                                conversationID: arg.conversationID,
                                authorId: arg.authorId,
                                text: arg.text,
                                sentAt: new Date().toISOString(),
                                status: 'sending',
                                attachments: arg.attachments,
                            };
                            draft.items = dedupeById([...draft.items, temp]);
                        }
                    )
                );
                try {
                    const { data } = await queryFulfilled;
                    // Replace temp by real id
                    dispatch(
                        messageApi.util.updateQueryData(
                            'getMessages',
                            {
                                conversationID: arg.conversationID,
                                limit: 20,
                                cursor: null,
                            },
                            (draft) => {
                                draft.items = draft.items.map((m) =>
                                    m.status === 'sending' &&
                                    m.authorId === arg.authorId &&
                                    m.text === arg.text
                                        ? data.message
                                        : m
                                );
                            }
                        )
                    );
                } catch {
                    // rollback optimistic insert
                    patch.undo();
                }
            },
            invalidatesTags: (_res, _err, arg) => [
                { type: 'MessageList' as const, id: arg.conversationID },
            ],
        }),

        markReadUpTo: builder.mutation<
            { ok: boolean; modifiedCount: number },
            { conversationID: string; userID: string; upToMessageId: string }
        >({
            query: ({ conversationID, userID, upToMessageId }) => ({
                url: `messages/read-up-messages/${conversationID}/mark-read`,
                method: 'POST',
                body: { userID, upToMessageId },
            }),
            async onQueryStarted(
                { conversationID, userID, upToMessageId },
                { dispatch, queryFulfilled }
            ) {
                const patch = dispatch(
                    messageApi.util.updateQueryData(
                        'getMessages',
                        { conversationID, limit: 20, cursor: null },
                        (draft) => {
                            const nowISO = new Date().toISOString();
                            for (const m of draft.items) {
                                if (!m._id) continue;
                                if (m._id.localeCompare(upToMessageId) <= 0) {
                                    m.readBy = m.readBy || {};
                                    if (!m.readBy[userID])
                                        m.readBy[userID] = nowISO;
                                }
                            }
                        }
                    )
                );
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
            invalidatesTags: (_r, _e, a) => [
                { type: 'MessageList' as const, id: a.conversationID },
            ],
        }),
    }),
});

export const {
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkReadUpToMutation,
    useLazyGetMessagesQuery,
} = messageApi;
