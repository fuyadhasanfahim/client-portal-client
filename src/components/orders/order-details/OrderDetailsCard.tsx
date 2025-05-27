import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IOrder } from '@/types/order.interface';
import { IconImageInPicture } from '@tabler/icons-react';

export default function OrderDetailsCard({ order }: { order: IOrder }) {
    return (
        <section className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h4>
                            <strong>Order ID:</strong>
                        </h4>
                        <p>{order._id!}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <h4>
                                <strong>Order Status:</strong>
                            </h4>
                            <Badge
                                variant={'outline'}
                                className="border-2 border-primary text-primary bg-green-50"
                            >
                                {order.orderStatus}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <h4>
                                <strong>Working Status:</strong>
                            </h4>
                            <Badge
                                variant={'outline'}
                                className="border-2 border-primary text-primary bg-green-50"
                            >
                                {order.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <div className="text-primary bg-green-100 p-2 rounded-full">
                                <IconImageInPicture size={20} />
                            </div>
                            <span className="text-2xl font-semibold">
                                Service Info
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {order.services.map((service, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg"
                            >
                                {/* Service Header */}
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-lg font-medium text-gray-800">
                                        {service.name}
                                    </div>

                                    {service.price && (
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-semibold">
                                            ${service.price}
                                        </div>
                                    )}
                                </div>

                                {/* Types (if any) */}
                                {service.types && service.types.length > 0 && (
                                    <div className="mb-2 space-y-2">
                                        <h4 className="text-sm font-semibold text-gray-600">
                                            Types:
                                        </h4>
                                        {service.types.map(
                                            (type, typeIndex) => (
                                                <div
                                                    key={typeIndex}
                                                    className="pl-4 border-l border-gray-300"
                                                >
                                                    <p className="text-sm text-gray-700">
                                                        {type.name}{' '}
                                                        {type.price && (
                                                            <span className="text-xs text-gray-500">
                                                                (${type.price})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                {/* Complexity (if any) */}
                                {service.complexity && (
                                    <div className="mt-2">
                                        <h4 className="text-sm font-semibold text-gray-600">
                                            Complexity:
                                        </h4>
                                        <div className="pl-4 border-l border-gray-300">
                                            <p className="text-sm text-gray-700">
                                                {service.complexity.name}{' '}
                                                <span className="text-xs text-gray-500">
                                                    (${service.complexity.price}
                                                    )
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
