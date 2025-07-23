'use server'

import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export default async function getAuthToken() {
    const token = await getToken({
        req: {
            headers: {
                cookie: cookies(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
    });

    return token?.token;
}
