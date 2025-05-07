import { apiSlice } from '@/redux/api/apiSlice';

export const servicesApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            addService: build.mutation({
                query: (data) => ({
                    url: 'services/add-service',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Services'],
            }),
            getServices: build.query({
                query: ({
                    params: { page, quantity, searchQuery: query },
                }) => ({
                    url: 'services/get-all-services',
                    params: { page, quantity, searchQuery: query },
                }),
                providesTags: ['Services'],
            }),
            getSingleService: build.query({
                query: (id) => ({
                    url: 'services/get-service',
                    params: { id },
                }),
                providesTags: ['Services'],
            }),
            getServicesForUser: build.query({
                query: (userId) => ({
                    url: 'services/get-services-for-user',
                    params: { userId },
                }),
                providesTags: ['Services'],
            }),
            deleteService: build.mutation({
                query: (id) => ({
                    url: 'services/delete-service',
                    method: 'DELETE',
                    body: { id },
                }),
                invalidatesTags: ['Services'],
            }),
            updateService: build.mutation({
                query: ({ id, ...rest }) => ({
                    url: 'services/update-service',
                    method: 'PUT',
                    body: { id, data: rest },
                }),
                invalidatesTags: ['Services'],
            }),
            updateServiceStatus: build.mutation({
                query: ({ id, status }) => ({
                    url: 'services/update-status',
                    method: 'PUT',
                    body: { id, status },
                }),
                invalidatesTags: ['Services'],
            }),
        };
    },
});

export const {
    useAddServiceMutation,
    useGetServicesQuery,
    useGetSingleServiceQuery,
    useGetServicesForUserQuery,
    useDeleteServiceMutation,
    useUpdateServiceMutation,
    useUpdateServiceStatusMutation,
} = servicesApi;
