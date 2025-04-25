export interface IComplexity {
    label: string;
    price: number;
}

export default interface IService {
    _id?: string;
    name: string;
    complexities?: IComplexity[];
}
