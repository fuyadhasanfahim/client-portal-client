import { IOrder } from '@/types/order.interface';
import IUser from '@/types/user.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InvoiceState {
    selectedOrders: IOrder[];
    dateRange: {
        from: Date | undefined;
        to?: Date | undefined;
    };
    client: IUser | null;
    user: IUser | null;
}

const initialState: InvoiceState = {
    selectedOrders: [],
    dateRange: { from: undefined, to: undefined },
    client: null,
    user: null,
};

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        setSelectedOrders(state, action: PayloadAction<IOrder[]>) {
            state.selectedOrders = action.payload;
        },
        setDateRange(
            state,
            action: PayloadAction<{
                from: Date | undefined;
                to?: Date | undefined;
            }>
        ) {
            state.dateRange = action.payload;
        },
        setClient(state, action: PayloadAction<IUser | null>) {
            state.client = action.payload;
        },
        setUser(state, action: PayloadAction<IUser | null>) {
            state.user = action.payload;
        },
        clearInvoice(state) {
            state.selectedOrders = [];
            state.dateRange = { from: undefined, to: undefined };
            state.client = null;
            state.user = null;
        },
    },
});

export const {
    setSelectedOrders,
    setDateRange,
    setClient,
    setUser,
    clearInvoice,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
