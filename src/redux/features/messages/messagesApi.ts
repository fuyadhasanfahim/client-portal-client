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
            }),
        };
    },
});

export const { useSetMessageMutation } = messagesApi;
