'use client';

import { IOrder } from '@/types/order.interface';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsSummary from './OrderDetailsSummary';
import OrderDetailsServiceList from './OrderDetailsServiceList';
import OrderDetailsPaymentAndDetails from './OrderDetailsPaymentAndDetails';
import OrderDetailsInvoice from './OrderDetailsInvoice';
import getLoggedInUser from '@/utils/getLoggedInUser';

export default function OrderDetailsCard({ order }: { order: IOrder }) {
    const { user } = getLoggedInUser();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <OrderDetailsStatus status={order.status} role={user.role} />
                <OrderDetailsSummary order={order} />
                <OrderDetailsServiceList
                    backgroundOption={order.details?.backgroundOption}
                    height={order.details?.height}
                    imageResizing={
                        order.details?.imageResizing === true ? 'yes' : 'no'
                    }
                    images={order.details?.images}
                    instructions={order.details?.instructions}
                    backgroundColor={order.details?.backgroundColor}
                    returnFileFormat={order.details?.returnFileFormat}
                    services={order.services}
                    width={order.details?.width}
                    sourceFileLink={order.details?.sourceFileLink}
                    downloadLink={order.details?.downloadLink}
                />
            </div>

            <div className="space-y-6">
                <OrderDetailsPaymentAndDetails
                    paymentId={order.paymentID}
                    status={order.status}
                    total={order.total}
                    role={user.role}
                    paymentStatus={order.paymentStatus}
                    orderID={order.orderID}
                />
                <OrderDetailsInvoice order={order} user={user} />
            </div>
        </div>
    );
}
