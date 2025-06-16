import { apiSlice } from '@/redux/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getUsersWithRole: build.query({
                query: (role) => ({
                    url: 'user/get-user-with-role',
                    method: 'GET',
                    params: {
                        role,
                    },
                }),
                providesTags: ['Users'],
            }),
            getUser: build.query({
                query: (user_id) => ({
                    url: `user/get-user`,
                    params: {
                        user_id,
                    },
                }),
                providesTags: ['Users'],
            }),
            getAdmin: build.query({
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                query: (_arg) => ({
                    url: 'user/get-admin',
                }),
                providesTags: ['Users'],
            }),
        };
    },
});

export const { useGetUsersWithRoleQuery, useGetUserQuery, useGetAdminQuery } =
    userApi;
