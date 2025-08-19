'use client'

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    EmailTemplateProps,
    EmailTemplate,
} from '@/components/shared/EmailTemplate';

export const renderEmailTemplate = (props: EmailTemplateProps): string =>
    '<!DOCTYPE html>' +
    renderToStaticMarkup(React.createElement(EmailTemplate, props));

export const createPasswordResetEmail = (
    userName: string,
    userEmail: string,
    resetUrl: string
): string => {
    return renderEmailTemplate({
        emailTitle: 'Password Reset Request',
        userName,
        userEmail,
        emailMessage:
            'We received a request to reset your password. To complete the process, please click the button below:',
        primaryButton: {
            text: 'Reset Password',
            url: resetUrl,
        },
        footerMessage:
            "If you didn't request a password reset, you can safely ignore this email. This link will expire in 30 minutes.",
    });
};

export const createEmailVerificationEmail = (
    userName: string,
    userEmail: string,
    verificationUrl: string
): string => {
    return renderEmailTemplate({
        emailTitle: 'Verify Your Email Address',
        userName,
        userEmail,
        emailMessage:
            'Thank you for signing up! To complete your registration and verify your email address, please click the button below:',
        primaryButton: {
            text: 'Verify Email',
            url: verificationUrl,
        },
        footerMessage: 'This verification link will expire in 1 hour.',
        status: { text: 'Action Required', type: 'info' },
    });
};
