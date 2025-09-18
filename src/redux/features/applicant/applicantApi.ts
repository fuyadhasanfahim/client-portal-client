import { apiSlice } from '@/redux/api/apiSlice';

export const applicantApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
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
            }),
            providesTags: ['Applicant'],
        }),
        getApplicant: build.query({
            query: (id) => ({
                url: `applicants/get-applicant/${id}`,
                method: 'GET',
            }),
            providesTags: ['Applicant'],
        }),
        updateApplicant: build.mutation({
            query: ({ id, data }) => ({
                url: `applicants/update-applicant`,
                method: 'PUT',
                body: { id, data },
            }),
            invalidatesTags: ['Applicant'],
        }),
    }),
});

export const {
    useGetApplicantsQuery,
    useGetApplicantQuery,
    useUpdateApplicantMutation,
} = applicantApi;
