import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
    accessToken: string | undefined;
    user:
        | {
              id: string;
              name: string;
              email: string;
              image: string;
              role: 'User' | 'Admin';
          }
        | undefined;
}

const initialState: AuthState = {
    accessToken: undefined,
    user: undefined,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
        },
        userLoggedOut: (state) => {
            state.accessToken = undefined;
            state.user = undefined;
        },
    },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
