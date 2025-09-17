export default interface IJob {
    _id: string;
    title: string;
    company: string;
    location: string;
    datePosted: Date;
    vacancies: number;
    hasLogo: boolean;
    department: string;
    notes: string;
    salary: string;
    experience: string;
    employmentStatus: string;
    workplace: string;
    responsibilities: string[];
    requirements: string[];
    compensation: string[];
    active: boolean;
    apply: {
        email: string;
        subject: string;
    };
}
