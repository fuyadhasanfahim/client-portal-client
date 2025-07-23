import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserModel from '@/models/user.model';
import dbConfig from '@/lib/dbConfig';

export async function getUserData() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return null;
    await dbConfig();

    const userData = await UserModel.findOne({
        userID: session?.user?.id,
    }).select('-password');

    return userData;
}

// lib/getAuthToken.ts
export async function getAuthToken(): Promise<string> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL!}/api/users/get-token`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );

    const result = await response.json();
    console.log(result);
    return result.token;
}
