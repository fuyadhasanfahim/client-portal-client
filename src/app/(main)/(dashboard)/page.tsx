import { getUserData } from '@/actions/user.action';
import IUser from '@/types/user.interface';

export default async function Page() {
    const userData = await getUserData();

    const { name } = (userData as IUser) || {};

    return <div className="text-2xl font-mono">Hi, {name}</div>;
}
