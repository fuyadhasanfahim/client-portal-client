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

        // gbkwjsdfg
        getUsersWithRole: builder.query({
            query: (role) => ({
                url: 'users/get-user-with-role',
                method: 'GET',
                params: { role },
            }),
            providesTags: ['Users'],
        }),
        getUser: builder.query({
            query: (user_id) => ({
                url: `users/get-user`,
                params: { user_id },
            }),
            providesTags: ['Users'],
        }),
        getAdmin: builder.query({
            query: () => ({ url: 'users/get-admin' }),
            providesTags: ['Users'],
        }),
        getLoggedInUser: builder.query({
            query: () => 'users/get-info',
            providesTags: ['Users'],
        }),
    }),
});

export const {
    useGetMeQuery,
    useGetUserInfoQuery,
    useGetOrdersByUserIDQuery,
    useUpdateUserInfoMutation,
    useGetUsersQuery,

    //sdfgbasd
    useGetUsersWithRoleQuery,
    useGetUserQuery,
    useGetAdminQuery,
    useGetLoggedInUserQuery,
} = userApi;
