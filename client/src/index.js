import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import userReducer from './reducers/userSlice';
import languageReducer from './reducers/languageSlice';
import AdminLayout from 'layouts/Admin/Admin.js';
import LoginLayout from 'layouts/Login/Login.js';
import SignUpLayout from 'layouts/Register/Register.js';
import AuthGuard from './reducers/AuthGuard';
import 'assets/scss/black-dashboard-react.scss';

import 'assets/demo/demo.css';
import 'assets/css/nucleo-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'fontsource-roboto';
import 'material-icons/iconfont/material-icons.css';

import ThemeContextWrapper from './components/ThemeWrapper/ThemeWrapper';
import BackgroundColorWrapper from './components/BackgroundColorWrapper/BackgroundColorWrapper';
import LanguageWatcher from 'utils/LanguageWatcher';

const store = configureStore({
    reducer: {
        user: userReducer,
        language: languageReducer,
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <ThemeContextWrapper>
            <BackgroundColorWrapper>
                <BrowserRouter>
                    <LanguageWatcher />
                    <Routes>
                        <Route path="/admin/*" element={<AuthGuard><AdminLayout /></AuthGuard>} />
                        <Route path="/sign-in" element={<LoginLayout />} />
                        <Route path="/sign-up" element={<SignUpLayout />} />
                        <Route
                            path="/"
                            element={<Navigate to="/sign-in" replace />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/sign-in" replace />}
                        />
                    </Routes>
                </BrowserRouter>
            </BackgroundColorWrapper>
        </ThemeContextWrapper>
    </Provider>,
);
