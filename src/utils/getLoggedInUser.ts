import { useAppSelector } from '@/hooks/redux-hooks';
import { RootState } from '@/redux/store';

export default function useLoggedInUser() {
    const user = useAppSelector((state: RootState) => state.auth.user);
    return user ?? null;
}
