export interface IComplexity {
    _id?: string;
    label: string;
    price: number;
}

export default interface IService {
    _id?: string;
    name: string;
    price?: number;
    accessibleTo: 'All' | 'Custom';
    accessList?: string[];
    complexities?: IComplexity[];
    status: string;
}
