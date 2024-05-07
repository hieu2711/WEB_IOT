import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function PasswordOTP({ value, onGetPassword, renew, setRenew }) {
    const [passwords, setPasswords] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const [timerId, setTimerId] = useState(null);

    const resetPasswords = () => {
        setPasswords(['', '', '', '', '', '']);
    };

    const startTimer = () => {
        const newTimerId = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                if (prevTimeLeft > 0) {
                    return prevTimeLeft - 1;
                } else {
                    clearInterval(newTimerId);
                    setRenew(false); // Set lại state renew thành false khi timeLeft bằng 0
                    resetPasswords();
                    return prevTimeLeft;
                }
            });
        }, 1000);
        setTimerId(newTimerId);
    };

    const handlePasswordChange = (e, index) => {
        const newValue = e.target.value;
        const newPasswords = [...passwords];
        newPasswords[index] = newValue;
        setPasswords(newPasswords);

        // Nếu đã nhập đủ 6 ô thì gửi giá trị lên component cha
        if (newPasswords.every((password) => password.length === 1)) {
            let isFirstDigitZero = false;
            if (newPasswords[0] === '0') {
                isFirstDigitZero = newPasswords
                    .slice(1)
                    .some((password) => password !== '0');
            }

            // Nối các số lại với nhau để tạo thành mã OTP
            const concatenatedPassword = newPasswords.join('');

            // Nếu ô input đầu tiên có giá trị là số 0 và các ô input sau đó có giá trị khác 0,
            // giữ số 0 đó trong mã OTP
            // const otpValue = isFirstDigitZero ? parseInt(concatenatedPassword, 10) : parseInt(concatenatedPassword, 10);

            // Gửi giá trị lên component cha
            onGetPassword(concatenatedPassword);
        }
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    useEffect(() => {
        if (renew) {
            setTimeLeft(60); // Reset lại giá trị timeLeft khi renew thành true
            clearInterval(timerId); // Xóa interval hiện tại (nếu có)
            startTimer(); // Khởi động lại đếm ngược
        } else {
            resetPasswords();
        }
    }, [renew]); // Khi renew thay đổi, sẽ thực hiện lại useEffect này

    return (
        <div
            className="password-input"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ display: 'flex' }}>
                {/* Tạo 6 ô input */}
                {passwords.map((password, index) => (
                    <input
                        key={index}
                        type="password"
                        className="form-control d-inline-block mr-2"
                        value={password}
                        onChange={(e) => handlePasswordChange(e, index)}
                        maxLength="1"
                        style={{
                            width: '40px',
                            textAlign: 'center',
                            fontSize: '24px',
                            border: '1px solid #4682B4',
                        }}
                    />
                ))}
            </div>
            <div style={{ marginLeft: 'auto' }} className="mt-2">
                {!renew ? (
                    <p>
                        {value
                            ? 'OTP hết hạn. Nhấn Get OTP để nhận mã mới!'
                            : 'OTP expires. Click Get OTP to receive a new code!'}
                    </p>
                ) : (
                    <p>
                        {value ? 'Mã sẽ hết hạn sau:' : 'OTP code expires:'}{' '}
                        <strong>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</strong>
                    </p>
                )}
            </div>
        </div>
    );
}

export default PasswordOTP;
