import { apiSlice } from '@/redux/api/apiSlice';

export const jobApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getJobs: build.query({
                query: ({
                    search = '',
                    page = 1,
                    limit = 10,
                    filter,
                    sort,
                    sortOrder,
                }) => ({
                    url: 'jobs/get-jobs',
                    method: 'GET',
                    params: {
                        search,
                        page,
                        limit,
                        filter,
                        sort,
                        sortOrder,
                    },
                    invalidatesTags: ['Job'],
                }),
            }),
            getJob: build.query({
                query: (id) => ({
                    url: `jobs/get-job/${id}`,
                    method: 'GET',
                    invalidatesTags: ['Job'],
                }),
            }),
        };
    },
});

export const { useGetJobsQuery, useGetJobQuery } = jobApi;
