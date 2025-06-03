'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import Image from 'next/image';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsSummary from './OrderDetailsSummary';
import OrderDetailsServiceList from './OrderDetailsServiceList';

export default function OrderDetailsCard({
    order,
    user,
}: {
    order: IOrder;
    user: {
        userID: string;
        name: string;
        role: string;
        profileImage: string;
    };
}) {
    const {
        orderID,
        services,
        images,
        imageResizing,
        width,
        height,
        backgroundOption,
        returnFileFormat,
        instructions,
        status,
        createdAt,
        isPaid,
        paymentId,
        paymentMethod,
        paymentOption,
        supportingFileDownloadLink,
        total,
        deliveryDate,
    } = order;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
            <div className="col-span-2 space-y-6">
                <OrderDetailsStatus status={status} user={user} />
                <OrderDetailsSummary
                    createdAt={createdAt}
                    deliveryDate={deliveryDate}
                    isPaid={isPaid}
                    orderID={orderID}
                    status={status}
                    userName={user.name}
                    profileImage={user.profileImage}
                />

                {/* Services List */}
                <OrderDetailsServiceList
                    backgroundOption={backgroundOption}
                    height={height}
                    imageResizing={imageResizing}
                    images={images}
                    instructions={instructions}
                    returnFileFormat={returnFileFormat}
                    services={services}
                    width={width}
                />

                {/* Supporting Files */}
                {supportingFileDownloadLink && (
                    <Card>
                        <CardHeader>
                            <CardTitle>📎 Supporting Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a
                                href={supportingFileDownloadLink}
                                className="text-blue-600 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download Supporting File
                            </a>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Thumbnail & Payment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>📦 Order Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="aspect-[3/1] bg-gray-100 rounded relative overflow-hidden">
                            <Image
                                src="/banner-placeholder.png"
                                alt="Service"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800"
                        >
                            {status}
                        </Badge>
                        <p>
                            <strong>Total Price:</strong> ${total || 'N/A'}
                        </p>
                        <p>
                            <strong>Payment Method:</strong>{' '}
                            {paymentMethod || 'N/A'}
                        </p>
                        <p>
                            <strong>Payment Option:</strong>{' '}
                            {paymentOption || 'N/A'}
                        </p>
                        <p>
                            <strong>Payment ID:</strong> {paymentId || 'N/A'}
                        </p>
                        <button className="w-full mt-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                            Deliver Now
                        </button>
                    </CardContent>
                </Card>

                {/* Progress Tracker */}
                <Card>
                    <CardHeader>
                        <CardTitle>📍 Track Order</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <span>Requirements submitted</span>
                            <span className="text-green-600 font-semibold">
                                ●
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Order in revision</span>
                            <span className="text-yellow-600 font-semibold">
                                ●
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
