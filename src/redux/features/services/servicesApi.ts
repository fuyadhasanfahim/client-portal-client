import { apiSlice } from '@/redux/api/apiSlice';

export const servicesApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getServices: build.query({
                query: () => ({
                    url: 'services/get-services',
                    method: 'GET',
                }),
                providesTags: ['Services'],
            }),
            newService: build.mutation({
                query: (data) => ({
                    url: 'services/new-service',
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: ['Services'],
            }),
        };
    },
});

export const { useGetServicesQuery, useNewServiceMutation } = servicesApi;
