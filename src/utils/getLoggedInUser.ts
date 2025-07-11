import { useGetMeQuery } from '@/redux/features/users/userApi';

export default function getLoggedInUser() {
    const { data, isLoading, error } = useGetMeQuery({});

    return {
        user: isLoading ? {} : data?.data ?? {},
        isLoading,
        error,
    };
}
