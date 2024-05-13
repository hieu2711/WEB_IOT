import { Link, Navigate } from 'react-router-dom';
import css from '../../assets/css/register.css';
import { useEffect, useState } from 'react';
import Toogle from 'components/Toogle/Toogle';
import { SERVER } from 'configs/Apis';
import Swal from 'sweetalert2';
import { BeatLoader } from 'react-spinners';
function Register() {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [isSignUp, setIsSignUp] = useState(false);
    const [registerFail, setRegisterFail] = useState('');
    const [value, setValue] = useState(false);
    const [language, setLanguage] = useState(value ? 'vi' : 'en');
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setLanguage(value ? 'vi' : 'en');
    }, [value]);
    const handleRegister = async () => {
        if (/\s/.test(userName) || /\s/.test(email) || /\s/.test(password)) {
            Swal.fire({
                text: language === 'en' ? 'Username, email, and password must not contain spaces in between!' : 'Tên đăng nhập, email, và mật khẩu không được chứa khoảng trắng ở giữa!',
                icon: 'error',
            });
            return;
        }

        // Kiểm tra mật khẩu có ít nhất 6 ký tự và chứa cả chữ và số
        const containsNumber = /\d/.test(password);
        const containsLetter = /[a-zA-Z]/.test(password);
        if (!containsNumber || !containsLetter || password.length < 6) {
            Swal.fire({
                text: language === 'en' ? 'Passwords must contain at least 6 characters and include both letters and numbers!' : 'Mật khẩu phải chứa ít nhất 6 ký tự và bao gồm cả chữ cái và số!',
                icon: 'error',
            });
            return;
        }

        // Kiểm tra tên người dùng có chứa ít nhất một chữ cái
        const containsLetterUser = /[a-zA-Z]/.test(userName);
        if (!containsLetterUser) {
            Swal.fire({
                text: language === 'en' ? 'The username must contain letters!' : 'Tên người dùng phải chứa chữ cái!',
                icon: 'error',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${SERVER}/api/auth/register_viewer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName,
                    password: password,
                    name: name,
                    email: email,
                    language: language,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const data = await response.json();
            console.log('Đăng kí thành công:', data);
            setIsSignUp(true);
        } catch (error) {
            console.error('Lỗi khi đăng kí:', error.message);
            setRegisterFail(error.message);
        } finally{
            setIsLoading(false);
        }
    };
    if (isSignUp) {
        return <Navigate to="/sign-in/" />;
    }
    console.log(value);
    return (
        <>
            <div className="MuiBox-root css-19bmmkw">
                <div className="MuiContainer-root MuiContainer-maxWidthLg css-i57t81">
                    <div className="MuiBox-root css-tubzw0">
                        <div className="MuiBox-root css-bboo8v">
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
                    <div className="MuiBox-root css-1xvyjnn">
                        <div className="MuiBox-root css-ds90uk">
                            <div className="MuiBox-root css-kn8iqp">
                                <form
                                    className="MuiBox-root css-1qu4u9j"
                                    role="form"
                                >
                                    <p className="MuiTypography-root MuiTypography-body1 css-8fcuhg">
                                        {value
                                            ? 'Đăng kí với'
                                            : 'Register with'}
                                    </p>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                {value ? 'Tên' : 'Name'}
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-r6q3am">
                                                <input
                                                    placeholder={
                                                        value
                                                            ? 'Tên của bạn...'
                                                            : 'Your full name...'
                                                    }
                                                    type="text"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                {value
                                                    ? 'Tên đăng nhập'
                                                    : 'Username'}
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-r6q3am">
                                                <input
                                                    placeholder={
                                                        value
                                                            ? 'Tên đăng nhập...'
                                                            : 'Username...'
                                                    }
                                                    type="text"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={(e) =>
                                                        setUserName(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="MuiBox-root css-vz2i8e">
                                        <div className="MuiBox-root css-63xtou">
                                            <label className="MuiTypography-root MuiTypography-button css-1bw07gz">
                                                Email
                                            </label>
                                        </div>
                                        <div className="MuiBox-root css-19i8cn2">
                                            <div className="MuiInputBase-root MuiInputBase-colorPrimary css-r6q3am">
                                                <input
                                                    placeholder={
                                                        value
                                                            ? 'Email...'
                                                            : 'Email...'
                                                    }
                                                    type="email"
                                                    className="MuiInputBase-input css-1bqqmdo"
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
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
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="MuiBox-root css-1p5pdz0">
                                        <button
                                            className="MuiButton-root MuiButton-contained MuiButton-containedWhite MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-fullWidth MuiButtonBase-root css-1b29d4y"
                                            tabindex="0"
                                            type="button"
                                            onClick={handleRegister}
                                        >
                                            {value ? 'Đăng kí' : 'SIGN UP'}
                                        </button>
                                    </div>
                                    {registerFail && (
                                        <div className="text text-danger">
                                            <i
                                                class="fa-solid fa-circle-exclamation mr-1"
                                                style={{
                                                    color: 'red',
                                                    margin: '0',
                                                    padding: '0',
                                                }}
                                            ></i>
                                            {registerFail}
                                        </div>
                                    )}
                                    <div className="MuiBox-root css-1xyaojc">
                                        <span className="MuiTypography-root MuiTypography-button css-1j3s1sb">
                                            {value
                                                ? 'Bạn đã có tài khoản'
                                                : 'Already have an account?'}{' '}
                                            <Link
                                                className="MuiTypography-root MuiTypography-button css-1bw07gz"
                                                to={'/sign-in/'}
                                            >
                                                {value
                                                    ? 'Đăng nhập'
                                                    : 'Sign in'}
                                            </Link>
                                        </span>
                                        {isLoading && <BeatLoader color='white' />}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
