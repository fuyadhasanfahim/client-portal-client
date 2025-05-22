export interface IDraftComplexity {
    _id: string;
    name: string;
    price: number;
}

export interface IDraftType {
    _id: string;
    name: string;
    price?: number;
    complexity?: {
        _id: string;
        name: string;
        price: number;
    };
}

export interface IDraftService {
    _id: string;
    name: string;
    price?: number;
    inputs?: boolean;
    colorCodes?: string[];
    types?: IDraftType[];
    complexity?: IDraftComplexity;
}

export interface IDraftOrder {
    userId: string;
    services: IDraftService[];
    isDraft?: boolean;
}
