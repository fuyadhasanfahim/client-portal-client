'use client';

import { IOrder } from '@/types/order.interface';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsSummary from './OrderDetailsSummary';
import OrderDetailsServiceList from './OrderDetailsServiceList';
import OrderDetailsPaymentAndDetails from './OrderDetailsPaymentAndDetails';
import OrderDetailsInvoice from './OrderDetailsInvoice';
import getLoggedInUser from '@/utils/getLoggedInUser';
import React from 'react';
import OrderDetailsRevisions from './OrderDetailsRevisions';
import { IRevision } from '@/types/revision.interface';

export default function OrderDetailsCard({
    order,
    revision,
}: {
    order: IOrder;
    revision: IRevision;
}) {
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
                    downloadLink={order.details?.downloadLink}
                    deliveryLink={order.details?.deliveryLink}
                />
                <OrderDetailsRevisions revision={revision} />
            </div>

            <div className="space-y-6">
                <OrderDetailsPaymentAndDetails
                    paymentId={order.paymentID}
                    status={order.status}
                    total={order.total}
                    role={user.role}
                    paymentStatus={order.paymentStatus}
                    orderID={order.orderID}
                    isRevision={order.isRevision}
                    deliveryLink={order.details?.deliveryLink}
                />
                <OrderDetailsInvoice order={order} user={user} />
            </div>
        </div>
    );
}
