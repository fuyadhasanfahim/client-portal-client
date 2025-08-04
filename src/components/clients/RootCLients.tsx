import { getUserData } from '@/actions/user.action';
import ClientDataTable from './ClientDataTable';

export default async function RootCLients() {
    const user = await getUserData();

    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Clients Summery
                </h2>
            </div>

            <ClientDataTable id={user.userID} />
        </section>
    );
}
