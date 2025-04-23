'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { IconInnerShadowTop } from '@tabler/icons-react';

export default function Loading() {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing...');

    useEffect(() => {
        const texts = [
            'Initializing...',
            'Loading components...',
            'Preparing your experience...',
            'Almost there...',
            'Ready!',
        ];

        const timer = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 1;
            });
        }, 40);

        const textTimer = setInterval(() => {
            const textIndex = Math.min(
                Math.floor(loadingProgress / 20),
                texts.length - 1
            );
            setLoadingText(texts[textIndex]);
        }, 500);

        return () => {
            clearInterval(timer);
            clearInterval(textTimer);
        };
    }, [loadingProgress]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
            <div className="w-full max-w-md p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-black rounded-full opacity-10 blur-xl animate-pulse"></div>
                        <IconInnerShadowTop className="relative z-10 w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center" />
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2">
                        Welcome to the Client Portal
                    </h2>
                </div>

                <div className="space-y-4">
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 text-black animate-spin" />
                            <span className="text-sm text-gray-700">
                                {loadingText}
                            </span>
                        </div>
                        <span className="text-sm font-medium text-black">
                            {loadingProgress}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center text-gray-500 text-xs">
                <p>
                    © {new Date().getFullYear()} All rights reserved by Client
                    Portal
                </p>
            </div>
        </div>
    );
}
