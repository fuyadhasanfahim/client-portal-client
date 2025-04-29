'use client';

import { ReactNode, useRef } from 'react';
import { Provider } from 'react-redux';
import { store, AppStore } from '@/redux/store';

export default function ReduxProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = store();
    }

    return <Provider store={storeRef.current}>{children}</Provider>;
}
