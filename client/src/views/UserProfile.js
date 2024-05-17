import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../reducers/userSlice';
import { updateUser } from '../reducers/userSlice';
import { BeatLoader } from 'react-spinners';

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardText,
    FormGroup,
    Form,
    Input,
    Row,
    Col,
} from 'reactstrap';
import Swal from 'sweetalert2';

function UserProfile() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const language = useSelector((state) => state.language.language);
    const [loading, setLoading] = useState(false);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    useEffect(() => {
        const userFromLocalStorage = JSON.parse(localStorage.getItem('user'));
        if (userFromLocalStorage) {
            dispatch(
                loginSuccess({
                    token: userFromLocalStorage.token,
                    user: userFromLocalStorage,
                }),
            );
            setIsLoading(false);
        }
    }, [dispatch]);
    useEffect(() => {
        if (user) {
            setName(user.name);
            setUserName(user.username);
            setEmail(user.email);
        }
    }, [user]);
    const handleUpdateUser = async () => {
        setLoading(true)
        if (/\s/.test(newPassword) || /\s/.test(confirmNewPassword) || /\s/.test(userName)) {
            Swal.fire({
                text: language === 'en' ? 'Do not have spaces!' : 'Không được có khoảng trắng!',
                icon: 'error',
            });
            return;
        }
    

        if (newPassword !== confirmNewPassword) {
            const result = await Swal.fire(
                language === 'en' ? 'Update Failed!' : 'Cập nhật thất bại!',
                language === 'en'
                    ? 'Confirmed password does not match the new password!'
                    : 'Xác nhận mật khẩu không khớp!',
                'error',
            );
            if (result.isConfirmed) {
                setNewPassword('');
                setConfirmNewPassword('');
            }
            return;
        }
        const userData = {
            name: name === '' ? user.name : name,
            username: userName === '' ? user.username : userName,
            email: email === '' ? user.email : email,
            password: newPassword,
            oldPassword: password,
            language:language
        };
        try {
            const response = await fetch(
                'https://web-iot-server.onrender.com/api/user?id=' + user.userid,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }
            dispatch(updateUser(userData));
            Swal.fire(
                language === 'en'
                    ? 'Update Successfully!'
                    : 'Cập nhật thành công!',
                language === 'en'
                    ? 'User information updated successfully!'
                    : 'Cập nhật thông tin người dùng thành công!',
                'success',
            ).then((result) => {
                setNewPassword('');
                setConfirmNewPassword('');
                setPassword('');
            });
            const updatedUserData = { ...user, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUserData));
        } catch (error) {
            console.error('Failed to update user:', error.message);
            Swal.fire(
                language === 'en' ? 'Update failed!' : 'Cập nhật thất bại!',
                error.message,
                'error',
            );
        }
        setLoading(false)
    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!isLoggedIn) {
        return <Navigate to="/sign-in" />;
    }
    return (
        <>
            <div className="content">
                <Row>
                    <Col md="8">
                        <Card>
                            <CardHeader>
                                <h5 className="title">
                                    {language === 'en'
                                        ? 'Edit Profile'
                                        : 'Chỉnh sửa trang cá nhân'}
                                </h5>
                            </CardHeader>
                            <CardBody>
                                <Form>
                                    <Row>
                                        <Col className="pr-md-1" md="5">
                                            <FormGroup>
                                                <label>
                                                    {language === 'en'
                                                        ? 'Full name'
                                                        : 'Tên'}
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="Fullname"
                                                    defaultValue={user.name}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="px-md-1" md="5">
                                            <FormGroup>
                                                <label>{language === 'en'
                                                        ? 'Username'
                                                        : 'Tên đăng nhập'}</label>
                                                <Input
                                                    placeholder="Username"
                                                    type="text"
                                                    defaultValue={user.username}
                                                    onChange={(e) =>
                                                        setUserName(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="5">
                                            <FormGroup>
                                                <label htmlFor="exampleInputEmail1">
                                                    Email
                                                </label>
                                                <Input
                                                    placeholder="Email address"
                                                    type="email"
                                                    defaultValue={user.email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="pl-md-1" md="3">
                                            <FormGroup>
                                                <label>
                                                    {language === 'en'
                                                        ? 'Role'
                                                        : 'Quyền'}
                                                </label>
                                                <Input
                                                    placeholder="Role"
                                                    type="text"
                                                    defaultValue={user.roles}
                                                    value={user.roles}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="5">
                                            <FormGroup>
                                                <label>
                                                    {language === 'en'
                                                        ? 'Old Password'
                                                        : 'Mật khẩu cũ'}
                                                </label>
                                                <Input
                                                    type="password"
                                                    placeholder={
                                                        language === 'en'
                                                            ? 'Old Password'
                                                            : 'Mật khẩu cũ'
                                                    }
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    value={password}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-md-1" md="5">
                                            <FormGroup>
                                                <label htmlFor="exampleInputEmail1">
                                                    {language === 'en'
                                                        ? 'New Password'
                                                        : 'Mật khẩu mới'}
                                                </label>
                                                <Input
                                                    placeholder={
                                                        language === 'en'
                                                            ? 'New Password'
                                                            : 'Mật khẩu mới'
                                                    }
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) =>
                                                        setNewPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col className="pl-md-1" md="5">
                                            <FormGroup>
                                                <label htmlFor="exampleInputEmail1">
                                                    {language === 'en'
                                                        ? 'Enter a new password'
                                                        : 'Nhập lại mật khẩu mới'}
                                                </label>
                                                <Input
                                                    placeholder={
                                                        language === 'en'
                                                            ? 'Enter a new password'
                                                            : 'Nhập lại mật khẩu mới'
                                                    }
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(e) =>
                                                        setConfirmNewPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                            <CardFooter>
                                <Button
                                    className="btn-fill"
                                    color="primary"
                                    type="submit"
                                    onClick={handleUpdateUser}
                                >
                                    {language === 'en' ? 'Save' : 'Lưu'}
                                </Button>
                                {loading && <BeatLoader color='white' />}
                            </CardFooter>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card className="card-user">
                            <CardBody>
                                <CardText />
                                <div className="author">
                                    <div className="block block-one" />
                                    <div className="block block-two" />
                                    <div className="block block-three" />
                                    <div className="block block-four" />
                                    <a
                                        href="#pablo"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <img
                                            alt="..."
                                            className="avatar"
                                            src={require('assets/img/user.png')}
                                        />
                                        <h5 className="title">{user.name}</h5>
                                    </a>
                                    <p className="description">{user.roles}</p>
                                </div>
                                <div className="card-description text-center">
                                    {(() => {
                                        switch (user.roles) {
                                            case 'Admin':
                                                return language === 'en'
                                                    ? 'There is all all rights in the system!'
                                                    : 'Có toàn quyền của hệ thống!';
                                            case 'User':
                                                return language === 'en'
                                                    ? 'Have the right to view and statistical data in the system!'
                                                    : 'Có quyền xem và thống kê dữ liệu của hệ thống!';
                                            case 'Viewer':
                                                return language === 'en'
                                                    ? 'Have the right to view data in the system!'
                                                    : 'Có quyền xem dữ liệu của hệ thống!';
                                            default:
                                                return 'Unknown Description';
                                        }
                                    })()}
                                </div>
                            </CardBody>
                            <CardFooter>
                                <div className="button-container">
                                    <Button
                                        className="btn-icon btn-round"
                                        color="facebook"
                                    >
                                        <i className="fab fa-facebook" />
                                    </Button>
                                    <Button
                                        className="btn-icon btn-round"
                                        color="twitter"
                                    >
                                        <i className="fab fa-twitter" />
                                    </Button>
                                    <Button
                                        className="btn-icon btn-round"
                                        color="google"
                                    >
                                        <i className="fab fa-google-plus" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default UserProfile;
