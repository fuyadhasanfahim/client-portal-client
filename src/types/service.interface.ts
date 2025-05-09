export interface IComplexity {
    _id?: string;
    label: string;
    price: number;
}

export interface IType {
    _id?: string;
    title: string;
}

export default interface IService {
    _id?: string;
    name: string;
    price?: number;
    accessibleTo: 'All' | 'Custom';
    accessList?: string[];
    complexities?: IComplexity[];
    types?: IType[];
    status: 'Active' | 'Inactive' | 'Pending';
}
