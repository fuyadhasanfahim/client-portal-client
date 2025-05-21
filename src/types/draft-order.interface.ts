export interface IDraftService {
    name: string;
    price?: number;
    types?: {
        name: string;
        complexity: {
            name: string;
            price: number;
        };
    }[];
    complexity?: {
        name: string;
        price: number;
    };
    colorCodes?: string[];
    resizing?: {
        width: number;
        height: number;
    };
}

export interface IDraftOrder {
    userId: string;
    services: IDraftService[];
    isDraft?: boolean;
}
