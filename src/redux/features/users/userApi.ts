import { apiSlice } from '@/redux/api/apiSlice';
import { ISanitizedUser } from '@/types/user.interface';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query({
            query: (token) => ({
                url: 'users/me',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        }),
        getUserInfo: builder.query({
            query: (userID) => ({
                url: `users/get-info/${userID}`,
                method: 'GET',
            }),
        }),
        getOrdersByUserID: builder.query({
            query: (userID) => ({
                url: `users/get-orders/${userID}`,
                method: 'GET',
            }),
        }),
        updateUserInfo: builder.mutation({
            query: ({
                userID,
                data,
            }: {
                userID: string;
                data: Partial<ISanitizedUser>;
            }) => ({
                url: 'users/update-info',
                method: 'PUT',
                body: { userID, data },
            }),
            invalidatesTags: ['Users'],
        }),
        getUsers: builder.query({
            query: (role) => ({
                url: 'users/get-users',
                method: 'GET',
                params: { role },
            }),
            providesTags: ['Users'],
        }),
        updateUser: builder.mutation({
            query: ({ userID, data }) => ({
                url: `users/update-info/${userID}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),
        updatePassword: builder.mutation({
            query: ({ userID, password }) => ({
                url: `users/update-password/${userID}`,
                method: 'PUT',
                body: password,
            }),
            invalidatesTags: ['Users'],
        }),
        updateAvatar: builder.mutation({
            query: ({ userID, file }) => ({
                url: `users/update-password/${userID}`,
                method: 'PUT',
                body: file,
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useGetMeQuery,
    useGetUserInfoQuery,
    useGetOrdersByUserIDQuery,
    useUpdateUserInfoMutation,
    useGetUsersQuery,
    useUpdateUserMutation,
    useUpdatePasswordMutation,
    useUpdateAvatarMutation,
} = userApi;
