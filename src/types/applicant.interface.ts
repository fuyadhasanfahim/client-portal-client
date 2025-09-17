import { Types } from "mongoose";

export default interface IApplicant {
    _id: string;
    jobId: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentUrl: string;
    documentPublicID: string;
    coverLetter?: string;
    portfolioUrl?: string;
    socials?: {
        facebook?: string;
        linkedin?: string;
    };
    experience?: {
        company: string;
        role: string;
        startDate: Date;
        endDate?: Date;
        currentlyWorking?: boolean;
        description?: string;
    }[];
    status: "applied" | "shortlisted" | "interview" | "hired" | "rejected";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
