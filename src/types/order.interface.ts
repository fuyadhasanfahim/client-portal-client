export interface IOrderComplexity {
    _id: string;
    name: string;
    price: number;
}

export interface IOrderType {
    _id: string;
    name: string;
    price?: number;
    complexity?: IOrderComplexity;
}

export interface IOrderService {
    _id: string;
    name: string;
    price?: number;
    inputs?: boolean;
    colorCodes?: string[];
    options?: string[];
    types?: IOrderType[];
    complexity?: IOrderComplexity;
}

export type OrderPaymentStatus =
    | 'Pending'
    | 'Pay Later'
    | 'Paid'
    | 'Payment Failed'
    | 'Refunded';

export type OrderStatus =
    | 'Pending'
    | 'In Progress'
    | 'Delivered'
    | 'In Revision'
    | 'Completed'
    | 'Canceled';

export type OrderOrderStatus =
    | 'Awaiting For Details'
    | 'Awaiting For Payment Details'
    | 'Waiting For Approval'
    | 'Accepted'
    | 'Canceled';

export interface IOrder {
    _id?: string;
    orderID: string;
    userID: string;
    services: IOrderService[];
    downloadLink?: string;
    images?: number;
    returnFileFormat?: string;
    backgroundOption?: string;
    imageResizing?: 'Yes' | 'No';
    width?: number;
    height?: number;
    instructions?: string;
    supportingFileDownloadLink?: string;
    total?: number;
    paymentOption?: string;
    paymentMethod?: string;
    paymentId?: string;
    isPaid?: boolean;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    orderStatus: OrderOrderStatus;
    deliveryDate?: Date;
    createdAt?: string;
    updatedAt?: string;
}
