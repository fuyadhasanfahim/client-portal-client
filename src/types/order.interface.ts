export interface IOrderService {
    _id?: string;
    name: string;
    price: number;
    complexity?: {
        label: string;
        price: number;
    };
    types?: [
        {
            title: string;
        }
    ];
    colorCode?: string;
    width?: number;
    height?: number;
}

export interface IOrder {
    services: IOrderService[];
    userId: string;
    orderId: string;
    downloadLink: string;
    date: Date;
    numberOfImages: number;
    price: number;
    returnFormate: string;
    instructions: string;
    paymentOption: string;
    paymentMethod?: string;
    isPaid?: boolean;
}
