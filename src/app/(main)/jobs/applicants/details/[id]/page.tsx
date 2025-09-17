import React from 'react';
import RootJobApplicantsDetails from '@/components/job/applicants/details/RootJobApplicantsDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Applicants Details | Client Portal',
};

export default async function JobApplicantsDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <RootJobApplicantsDetails id={id} />;
}
