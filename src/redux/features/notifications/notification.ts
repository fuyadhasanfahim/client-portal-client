import { apiSlice } from '@/redux/api/apiSlice';

export const notificationApi = apiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            getNotifications: builder.query({
                query: (userID) => ({
                    url: `notifications/get-notifications`,
                    method: 'GET',
                    params: { userID },
                }),
                providesTags: ['Notifications'],
            }),
            updateNotification: builder.mutation({
                query: (notificationID) => ({
                    url: `notifications/update-notification/${notificationID}`,
                    method: 'PUT',
                }),
                invalidatesTags: ['Notifications'],
            }),
        };
    },
});

export const { useGetNotificationsQuery, useUpdateNotificationMutation } =
    notificationApi;
