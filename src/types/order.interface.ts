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

export type OrderStatus =
    | 'draft'
    | 'awaiting-details'
    | 'awaiting-payment'
    | 'payment-processing'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

export interface IOrder {
    _id?: string;
    userId: string;
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
    paymentOption?: string;
    paymentMethod?: string;
    isPaid?: boolean;
    status: OrderStatus;
    createdAt?: string;
    updatedAt?: string;
}
