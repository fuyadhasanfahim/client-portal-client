export interface IComplexity {
    _id?: string;
    label: string;
    price: number;
}

export default interface IService {
    _id?: string;
    name: string;
    complexities?: IComplexity[];
    status: string;
}
