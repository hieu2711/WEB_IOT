import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
    token: null,
    user: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        updateUser: (state, action) => {
            const { name, username, password } = action.payload;
            if (name) state.user.name = name;
            if (username) state.user.username = username;
            if (password) state.user.password = password;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.token = null;
            state.user = null;
        },
    },
});

export const { loginSuccess, updateUser, logout } = userSlice.actions;
export const selectIsLoggedIn = (state) => state.user.isLoggedIn;
export const selectToken = (state) => state.user.token;
export const selectUser = (state) => state.user.user;

const userReducer = userSlice.reducer;
export default userReducer;
