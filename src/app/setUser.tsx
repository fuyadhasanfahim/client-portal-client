'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '@/redux/features/auth/authSlice';
import { useGetLoggedInUserQuery } from '@/redux/features/users/userApi';

export default function SetUser() {
    const { data: session, status } = useSession();
    const dispatch = useDispatch();

    const { data: userData, isSuccess } = useGetLoggedInUserQuery(undefined, {
        skip: status !== 'authenticated',
    });

    useEffect(() => {
        if (session?.user && isSuccess && userData?.success) {
            dispatch(
                userLoggedIn({
                    user: userData.data,
                })
            );
        }
    }, [session, isSuccess, userData, dispatch]);

    return null;
}
