import { apiSlice } from '@/redux/api/apiSlice';

export const applicantApi = apiSlice.injectEndpoints({
    endpoints(build) {
        return {
            getApplicants: build.query({
                query: ({
                    search = '',
                    page = 1,
                    limit = 10,
                    filter,
                    sort,
                    sortOrder,
                }) => ({
                    url: 'applicants/get-applicants',
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
            getApplicant: build.query({
                query: (id) => ({
                    url: `applicants/get-applicant/${id}`,
                    method: 'GET',
                    invalidatesTags: ['Job'],
                }),
            }),
        };
    },
});

export const { useGetApplicantsQuery, useGetApplicantQuery } = applicantApi;
