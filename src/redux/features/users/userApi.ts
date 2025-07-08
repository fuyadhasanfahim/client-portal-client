import { apiSlice } from '@/redux/api/apiSlice';
import { ISanitizedUser } from '@/types/user.interface';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserInfo: builder.query({
            query: (userID) => ({
                url: 'users/get-info',
                method: 'GET',
                body: userID,
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

        // gbkwjsdfg
        getUsersWithRole: builder.query({
            query: (role) => ({
                url: 'user/get-user-with-role',
                method: 'GET',
                params: { role },
            }),
            providesTags: ['Users'],
        }),
        getUser: builder.query({
            query: (user_id) => ({
                url: `user/get-user`,
                params: { user_id },
            }),
            providesTags: ['Users'],
        }),
        getAdmin: builder.query({
            query: () => ({ url: 'user/get-admin' }),
            providesTags: ['Users'],
        }),
        getLoggedInUser: builder.query({
            query: () => 'user/get-info',
            providesTags: ['Users'],
        }),
    }),
});

export const {
    useGetUserInfoQuery,
    useGetOrdersByUserIDQuery,
    useUpdateUserInfoMutation,

    //sdfgbasd
    useGetUsersWithRoleQuery,
    useGetUserQuery,
    useGetAdminQuery,
    useGetLoggedInUserQuery,
} = userApi;
