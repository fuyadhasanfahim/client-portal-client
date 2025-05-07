import { apiSlice } from '@/redux/api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getUsersWithRole: build.query({
                query: (role) => ({
                    url: `user/get-user-with-role?role=${role}`,
                }),
                providesTags: ['Users'],
            }),
        };
    },
});

export const { useGetUsersWithRoleQuery } = userApi;
