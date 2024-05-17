import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from './userSlice';

function AuthGuard({ children }) {
    const isLoggedIn = useSelector(selectIsLoggedIn);

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = '/sign-in';
        }
    }, [isLoggedIn]);

    return isLoggedIn ? children : null;
}

export default AuthGuard;
