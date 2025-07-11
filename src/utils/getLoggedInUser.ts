import { useGetMeQuery } from '@/redux/features/users/userApi';

export default function useLoggedInUser() {
    const { data, isLoading, error } = useGetMeQuery({});

    return {
        user: isLoading ? {} : data?.data ?? {},
        isLoading,
        error,
    };
}
