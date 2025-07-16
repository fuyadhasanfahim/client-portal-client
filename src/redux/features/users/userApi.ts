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
            query: ({ userID, newPassword, currentPassword }) => ({
                url: `users/update-password/${userID}`,
                method: 'PUT',
                body: { currentPassword, newPassword },
            }),
            invalidatesTags: ['Users'],
        }),
        updateAvatar: builder.mutation({
            query: ({ userID, formData }) => ({
                url: `users/upload-avatar/${userID}`,
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useGetMeQuery,
    useGetUserInfoQuery,
    useGetOrdersByUserIDQuery,
    useGetUsersQuery,
    useUpdateUserMutation,
    useUpdatePasswordMutation,
    useUpdateAvatarMutation,
} = userApi;
