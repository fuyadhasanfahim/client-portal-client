import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import invoiceReducer from './features/invoice/invoiceSlice';
import { apiSlice } from './api/apiSlice';

export const store = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            invoice: invoiceReducer,
            [apiSlice.reducerPath]: apiSlice.reducer,
        },
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddlewares) =>
            getDefaultMiddlewares().concat(apiSlice.middleware),
    });
};

export type AppStore = ReturnType<typeof store>;

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
