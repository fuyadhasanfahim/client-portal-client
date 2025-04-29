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
        };
    },
});

export const { useAddServiceMutation, useGetServicesQuery } = servicesApi;
