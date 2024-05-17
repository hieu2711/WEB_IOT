import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from './userSlice';
import { Navigate } from 'react-router-dom';

function AuthGuard({ children }) {
    const isLoggedIn = useSelector(selectIsLoggedIn);

    useEffect(() => {
        if (!isLoggedIn) {
            return <Navigate to="/sign-in" />;
        }
    }, [isLoggedIn]);

    return isLoggedIn ? children : null;
}

export default AuthGuard;
