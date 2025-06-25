import { apiSlice } from '@/redux/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getUsersWithRole: build.query({
            query: (role) => ({
                url: 'user/get-user-with-role',
                method: 'GET',
                params: { role },
            }),
            providesTags: ['Users'],
        }),
        getUser: build.query({
            query: (user_id) => ({
                url: `user/get-user`,
                params: { user_id },
            }),
            providesTags: ['Users'],
        }),
        getAdmin: build.query({
            query: () => ({ url: 'user/get-admin' }),
            providesTags: ['Users'],
        }),
        getLoggedInUser: build.query({
            query: () => 'user/get-loggedin-user',
            providesTags: ['Users'],
        }),
    }),
});

export const {
    useGetUsersWithRoleQuery,
    useGetUserQuery,
    useGetAdminQuery,
    useGetLoggedInUserQuery,
} = userApi;
