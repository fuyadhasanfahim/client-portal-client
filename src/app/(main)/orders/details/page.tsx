// import RootOrderDetails from '@/components/orders/order-details/RootOrderDetails';
// import { Metadata } from 'next';

// export const metadata: Metadata = {
//     title: 'Order Details| Client Portal',
// };

// export default async function OrderDetailsPage({
//     searchParams,
// }: {
//     searchParams: {
//         id: string;
//         status: string;
//     };
// }) {
//     const { id, status } = await searchParams;

//     if (!id || !status) {
//         console.log("error in order details page")
//     }

//     return <RootOrderDetails id={id} status={status} />;
// }

export default function Page() {
    return (
        <div></div>
    );
}