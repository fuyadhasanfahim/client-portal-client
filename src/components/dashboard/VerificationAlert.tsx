'use client';

import axiosInstance from '@/lib/axios-instance';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import ApiError from '../shared/ApiError';

export default function VerificationAlert({ email }: { email: string }) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendVerificationEmail = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.post(
                '/auth/send-verification-email',
                { email }
            );

            if (response.status === 200) {
                toast.success('Verification email sent successfully!');
            } else {
                toast.error('Failed to send verification email.');
            }
        } catch (error) {
            ApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button onClick={handleSendVerificationEmail}>
                {loading ? 'Sending...' : 'Send Verification Email'}
            </Button>
        </div>
    );
}
