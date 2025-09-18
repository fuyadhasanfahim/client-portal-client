'use client';

import React from 'react';
import { format } from 'date-fns';
import {
    useGetApplicantQuery,
    useUpdateApplicantMutation,
} from '@/redux/features/applicant/applicantApi';
import IApplicant from '@/types/applicant.interface';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import toast from 'react-hot-toast';
import ApiError from '@/components/shared/ApiError';
import { Loader2 } from 'lucide-react';

export default function RootJobApplicantsDetails({ id }: { id: string }) {
    const { data, isLoading, error } = useGetApplicantQuery(id, {
        skip: !id,
    });
    const [updateApplicant, { isLoading: isStatusChanging }] =
        useUpdateApplicantMutation();

    const applicant: IApplicant = data?.applicant;

    const handleStatusChange = async (status: string) => {
        try {
            const res = await updateApplicant({
                id: applicant._id,
                data: { status },
            }).unwrap();

            if (res.success) {
                toast.success(`Applicant status changed to ${status}`);
            }
        } catch (error) {
            ApiError(error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !applicant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Applicant Not Found
                    </h2>
                    <p className="text-gray-600">
                        Unable to load applicant details. Please try again
                        later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {applicant.firstName} {applicant.lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {applicant.email}
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                        applicant.status === 'applied'
                                            ? 'bg-blue-100 text-blue-800'
                                            : applicant.status === 'shortlisted'
                                            ? 'bg-purple-100 text-purple-800'
                                            : applicant.status === 'interview'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : applicant.status === 'hired'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {isStatusChanging ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        applicant.status
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Status Update Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="border-orange-200">
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        Update Application Status
                                    </CardTitle>
                                    <CardDescription>
                                        Change the current status of this
                                        application
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Select
                                        value={applicant?.status}
                                        onValueChange={(value) => {
                                            handleStatusChange(
                                                value as IApplicant['status']
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="applied"
                                                disabled
                                            >
                                                Applied
                                            </SelectItem>
                                            <SelectItem value="shortlisted">
                                                Shortlisted
                                            </SelectItem>
                                            <SelectItem value="interview">
                                                Interview
                                            </SelectItem>
                                            <SelectItem value="hired">
                                                Hired
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                                Rejected
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Status Explanation */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Status meaning:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                <span className="text-xs text-gray-600">
                                                    Applied - Application
                                                    received
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                                <span className="text-xs text-gray-600">
                                                    Shortlisted - Under review
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span className="text-xs text-gray-600">
                                                    Interview - Interview
                                                    scheduled
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span className="text-xs text-gray-600">
                                                    Hired - Candidate selected
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Phone
                                    </p>
                                    <p className="font-medium">
                                        {applicant.phone}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {applicant.email}
                                    </p>
                                </div>
                                {applicant.portfolioUrl && (
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-gray-500">
                                            Portfolio
                                        </p>
                                        <a
                                            href={applicant.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-orange-600 hover:underline"
                                        >
                                            {applicant.portfolioUrl}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Letter */}
                        {applicant.coverLetter && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-lg shadow p-6"
                            >
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    Cover Letter
                                </h2>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {applicant.coverLetter}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Work Experience */}
                        {applicant.experience &&
                            applicant.experience.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-lg shadow p-6"
                                >
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                                        Work Experience
                                    </h2>
                                    <div className="space-y-4">
                                        {applicant.experience.map(
                                            (exp, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: index * 0.1,
                                                    }}
                                                    className="border-l-4 border-orange-500 pl-4 py-2"
                                                >
                                                    <h3 className="font-medium text-gray-800">
                                                        {exp.role}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        {exp.company}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {format(
                                                            exp.startDate,
                                                            'PPP'
                                                        )}{' '}
                                                        -{' '}
                                                        {exp.currentlyWorking
                                                            ? 'Present'
                                                            : exp.endDate
                                                            ? format(
                                                                  exp.endDate,
                                                                  'PPP'
                                                              )
                                                            : 'Not specified'}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="text-gray-700 mt-2 text-sm">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </motion.div>
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Application Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Application Details
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Applied on
                                    </p>
                                    <p className="font-medium">
                                        {format(applicant.createdAt, 'PPP')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Last updated
                                    </p>
                                    <p className="font-medium">
                                        {format(applicant.updatedAt, 'PPP')}
                                    </p>
                                </div>
                                {applicant.documentUrl && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Resume/CV
                                        </p>
                                        <a
                                            href={applicant.documentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-orange-600 hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Social Links */}
                        {applicant.socials &&
                            (applicant.socials.linkedin ||
                                applicant.socials.facebook) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-lg shadow p-6"
                                >
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                                        Social Links
                                    </h2>
                                    <div className="space-y-2">
                                        {applicant.socials.linkedin && (
                                            <div>
                                                <a
                                                    href={
                                                        applicant.socials
                                                            .linkedin
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-orange-600 hover:underline"
                                                >
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                    LinkedIn Profile
                                                </a>
                                            </div>
                                        )}
                                        {applicant.socials.facebook && (
                                            <div>
                                                <a
                                                    href={
                                                        applicant.socials
                                                            .facebook
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-orange-600 hover:underline"
                                                >
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-2.5 7h-2.5v2.5h2.5v2.5h-2.5v7.5h-2.5v-7.5h-2.5v-2.5h2.5v-2.5c0-1.38 1.12-2.5 2.5-2.5h2.5v2.5z" />
                                                    </svg>
                                                    Facebook Profile
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                        {/* Notes */}
                        {applicant.notes && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-lg shadow p-6"
                            >
                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    Notes
                                </h2>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-gray-700">
                                        {applicant.notes}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
