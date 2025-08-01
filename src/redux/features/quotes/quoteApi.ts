import { apiSlice } from '@/redux/api/apiSlice';
import { IQuote } from '@/types/quote.interface';

export const quotesApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            newQuote: builder.mutation({
                query: ({
                    quoteStage,
                    userID,
                    services,
                    quoteID,
                    details,
                }: {
                    quoteStage: string;
                    userID: string;
                    services?: IQuote['services'];
                    quoteID?: string;
                    details?: IQuote['details'];
                }) => ({
                    url: `quotes/new-quote/${quoteStage}`,
                    method: 'POST',
                    body: {
                        userID,
                        services,
                        quoteID,
                        details,
                    },
                }),
                invalidatesTags: ['Quotes'],
            }),
            getQuoteByID: builder.query({
                query: (quoteID) => ({
                    url: `quotes/get-quote/${quoteID}`,
                    method: 'GET',
                }),
                providesTags: ['Quotes'],
            }),
        };
    },
});

export const { useNewQuoteMutation, useGetQuoteByIDQuery } = quotesApi;
