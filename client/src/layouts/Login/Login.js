import { Link, Navigate } from 'react-router-dom';
import css from '../../assets/css/login.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, selectIsLoggedIn } from '../../reducers/userSlice';
import PasswordOTP from 'components/PasswordOTP/PasswordOTP';
import Toogle from 'components/Toogle/Toogle';
import { SERVER } from 'configs/Apis';
import { BeatLoader } from 'react-spinners';
function Login() {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loginFail, setLoginFail] = useState('');
    const [type, setType] = useState(true);
    const [getOTP, setGetOTP] = useState(true);
    const [value, setValue] = useState(false);
    const [language, setLanguage] = useState(value ? 'vi' : 'en');
    const [passwordFromChild, setPasswordFromChild] = useState('');
    const [emailKey, setEmailKey] = useState(0);
    const [renew, setReNew] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleUserNameChange = (e) => {
        setUserName(e.target.value.trim());
    };
    const handleGetPasswordFromChild = (password) => {
        setPasswordFromChild(password);
    };
    useEffect(() => {
        setLanguage(value ? 'vi' : 'en');
    }, [value]);
    const handlePasswordChange = (e) => {
        setPassword(e.target.value.trim());
    };
    const handleSignInWithOTP = () => {
        setType(false);
        setLoginFail('');
        setEmail('');
        setEmailKey((prevKey) => prevKey + 1);
    };
    const handleSignIn = async () => {
        setIsLoading(true);
        setLoginFail('');
        try {
            const response = await fetch(`${SERVER}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName,
                    password: password,
                    language: language,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const data = await response.json();
            // Lưu token và user vào Local Storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            dispatch(loginSuccess(data));
            console.log('Đăng nhập thành công:', data);
            <Navigate to="/admin/dashboard" />;
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error.message);
            setLoginFail(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetOTP = async () => {
        setIsLoading(true);
        setLoginFail('');
        try {
            const response = await fetch(`${SERVER}/api/auth/loginemail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    language: language,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            setGetOTP(false);
            setReNew(true);
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error.message);
            setLoginFail(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleVerifyOTP = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${SERVER}/api/auth/verifyotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    otp: passwordFromChild,
                    language: language,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const data = await response.json();
            // Lưu token và user vào Local Storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');

            dispatch(loginSuccess(data));
            <Navigate to="/admin/dashboard" />;
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error.message);
            setLoginFail(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    if (isLoggedIn) {
        return <Navigate to="/admin/dashboard" />;
    }
    return (
        <div className="MuiBox-root css-19bmmkw">
            <div className="MuiContainer-root MuiContainer-maxWidthLg css-i57t81">
                <div className="MuiBox-root css-tubzw0">
                    <div className="MuiBox-root css-bboo8v ">
                        <Link
                            to={'/sign-in/'}
                            className="MuiBox-root css-10qjiem"
                            sx="[object Object]"
                        >
                            <span
                                className="material-icons-round notranslate MuiIcon-root MuiIcon-fontSizeInherit css-9xdub1"
                                aria-hidden="true"
                            >
                                key
                            </span>
                            <span className="MuiTypography-root MuiTypography-button css-123dmr5">
                                &nbsp;{value ? 'Đăng nhập' : 'Sign In'}
                            </span>
                        </Link>
                        <Link
                            to={'/sign-up/'}
                            className="MuiBox-root css-10qjiem"
                            sx="[object Object]"
                        >
                            <span
                                className="material-icons-round notranslate MuiIcon-root MuiIcon-fontSizeInherit css-9xdub1"
                                aria-hidden="true"
                            >
                                account_circle
                            </span>
                            <span className="MuiTypography-root MuiTypography-button css-123dmr5">
                                &nbsp;{value ? 'Đăng kí' : 'Sign Up'}
                            </span>
                        </Link>
                    </div>
                    <div
                        className=" d-flex justify-content-end ml-5"
                        style={{ marginTop: '6px' }}
                    >
                        <span className="mr-2 text-white">EN</span>
                        <Toogle
                            isOn={value}
                            handleToggle={() => setValue(!value)}
                        />
                        <span className="ml-2 text-white">VI</span>
                    </div>
                </div>
            </div>
            <div className="MuiBox-root css-1rxdjol">
                <div className="MuiBox-root css-1l23ay1">
                    <h6 className="MuiTypography-root MuiTypography-subtitle1 css-l4zvol">
                        {value
                            ? 'HT_Team Đại học Mở Tp.HCM'
                            : 'HT_Team OU University'}
                    </h6>
                    <h2 className="MuiTypography-root MuiTypography-h2 css-a7yvop">
                        {value
                            ? 'Hệ thống hiển thị thông tin thời tiết'
                            : 'Weather information display system'}
                    </h2>
                </div>
            </div>
            <div className="MuiBox-root css-8fz3bm">
                <div className="MuiBox-root css-1nqj0ra">
                    <div className="MuiBox-root css-1qulzli">
                        <div className="MuiBox-root css-kb9bp1">
                            <h3 className="MuiTypography-root MuiTypography-h3 css-yefcpi">
                                {value
                                    ? 'Chào bạn quay lại!'
                                    : 'Nice to see you!'}
                            </h3>
                            {type ? (
                                <p className="MuiTypography-root MuiTypography-body1 css-1ixcmzz">
                                    {value
                                        ? 'Nhập tên đăng nhập và mật khẩu để đăng nhập'
                                        : 'Enter your username and password to sign in'}
                                </p>
                            ) : (
                                <p className="MuiTypography-root MuiTypography-body1 css-1ixcmzz">
                                    {value
                                        ? 'Nhấn email để nhận OTP và đăng nhập'
                                        : 'Enter email to receive OTP and start sign in'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="MuiBox-root css-1desolg">
                        <form className="MuiBox-root css-7wmvu8" role="form">
                            {type ? (
                                <>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                {value
                                                    ? 'Tên đăng nhập'
                                                    : 'Username'}
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-11ojv3i">
                                                <input
                                                    placeholder={
                                                        value
                                                            ? 'Tên đăng nhập...'
                                                            : 'Your username...'
                                                    }
                                                    type="text"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={
                                                        handleUserNameChange
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                {value
                                                    ? 'Mật khẩu'
                                                    : 'Password'}
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-r6q3am">
                                                <input
                                                    placeholder={
                                                        value
                                                            ? 'Mật khẩu của bạn...'
                                                            : 'Your password...'
                                                    }
                                                    type="password"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={
                                                        handlePasswordChange
                                                    }
                                                    onKeyPress={(event) => {
                                                        if (
                                                            event.key ===
                                                            'Enter'
                                                        ) {
                                                            event.preventDefault();
                                                            handleSignIn();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                Email
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-11ojv3i">
                                                <input
                                                    key={emailKey}
                                                    placeholder="Email..."
                                                    type="email"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {!getOTP && (
                                        <PasswordOTP
                                            value={value}
                                            onGetPassword={
                                                handleGetPasswordFromChild
                                            }
                                            renew={renew}
                                            setRenew={setReNew}
                                        />
                                    )}
                                </>
                            )}
                            {type && (
                                <>
                                    <div className="MuiBox-root css-1p5pdz0">
                                        <button
                                            className="MuiButton-root MuiButton-contained MuiButton-containedWhite MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-fullWidth MuiButtonBase-root css-1b29d4y"
                                            tabindex="1"
                                            type="button"
                                            onClick={handleSignIn}
                                        >
                                            {value ? 'Đăng nhập' : 'SIGN-IN'}
                                        </button>
                                    </div>
                                    <div
                                        className="MuiBox-root css-1p5pdz0 "
                                        style={{ marginTop: '20px' }}
                                    >
                                        <button
                                            className="MuiButton-root MuiButton-contained MuiButton-containedWhite MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-fullWidth MuiButtonBase-root css-1b29d4y css-15pdz0"
                                            tabindex="0"
                                            type="button"
                                            onClick={handleSignInWithOTP}
                                            disabled={isLoading}
                                        >
                                            {value
                                                ? 'Đăng nhập với OTP'
                                                : 'SIGN IN WITH OTP'}
                                        </button>
                                    </div>
                                </>
                            )}
                            {!type && (
                                <div
                                    className="MuiBox-root css-1p5pdz0 "
                                    style={{ marginTop: '20px' }}
                                >
                                    <button
                                        className="MuiButton-root MuiButton-contained MuiButton-containedWhite MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-fullWidth MuiButtonBase-root css-1b29d4y css-15pdz0"
                                        tabindex="0"
                                        type="button"
                                        disabled={renew}
                                        onClick={handleGetOTP}
                                    >
                                        {value ? 'Lấy OTP' : 'GET OTP'}
                                    </button>
                                </div>
                            )}
                            {!getOTP && (
                                <div
                                    className="MuiBox-root css-1p5pdz0 "
                                    style={{ marginTop: '20px' }}
                                >
                                    <button
                                        className="MuiButton-root MuiButton-contained MuiButton-containedWhite MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-fullWidth MuiButtonBase-root css-1b29d4y css-15pdz0"
                                        tabindex="0"
                                        type="button"
                                        onClick={handleVerifyOTP}
                                    >
                                        {value ? 'Đăng nhập' : 'SIGN IN'}
                                    </button>
                                </div>
                            )}
                            {loginFail && (
                                <div className="text text-danger">
                                    <i
                                        class="fa-solid fa-circle-exclamation mr-1"
                                        style={{ color: 'red' }}
                                    ></i>
                                    {loginFail}
                                </div>
                            )}
                            {type ? (
                                <div className="MuiBox-root css-1xyaojc">
                                    <span className="MuiTypography-root MuiTypography-button css-1j3s1sb">
                                        {value
                                            ? 'Nếu bạn chưa có tài khoản?'
                                            : "Don't have an account?"}{' '}
                                        <Link
                                            className="MuiTypography-root MuiTypography-button css-1bw07gz"
                                            to="/sign-up/"
                                        >
                                            {value ? 'Đăng kí' : 'Sign up'}
                                        </Link>
                                    </span>
                                    {isLoading && <BeatLoader color="white" />}
                                </div>
                            ) : (
                                <div className="MuiBox-root css-1xyaojc">
                                    <span className="MuiTypography-root MuiTypography-button css-1j3s1sb">
                                        {value
                                            ? 'Đăng nhập với tên đăng nhập và mật khẩu?'
                                            : 'Sign in by username and password?'}{' '}
                                        <Link
                                            className="MuiTypography-root MuiTypography-button css-1bw07gz"
                                            to="/sign-in/"
                                            onClick={() => {
                                                setType(true);
                                                setGetOTP(true);
                                                setLoginFail('');
                                            }}
                                        >
                                            {value ? 'Đăng nhập' : 'Sign in'}
                                        </Link>
                                    </span>
                                    {isLoading && <BeatLoader color="white" />}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
