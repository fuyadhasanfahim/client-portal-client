import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserModel from '@/models/user.model';
import dbConfig from '@/lib/dbConfig';

export async function getUserData() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return null;
    await dbConfig();

    const userData = await UserModel.findOne({
        userId: session?.user?.id,
    }).select('-password');

    return userData;
}
