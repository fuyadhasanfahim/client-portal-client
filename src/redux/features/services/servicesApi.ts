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
        };
    },
});

export const { useGetServicesQuery } = servicesApi;
