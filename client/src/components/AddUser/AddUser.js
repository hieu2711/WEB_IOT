import { useState } from 'react';
import Swal from 'sweetalert2';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    FormGroup,
    Form,
    Input,
    Row,
    Col,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { SERVER } from 'configs/Apis';
function AddUser() {
    const [userName, setUserName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const language = useSelector((state) => state.language.language);
    const handleRegister = async () => {
        if (/\s/.test(userName) || /\s/.test(email)) {
            Swal.fire({
                text: language === 'en' ? 'Username, email must not contain spaces in between!' : 'Tên đăng nhập, email không được chứa khoảng trắng ở giữa!',
                icon: 'error',
            });
            return;
        }
        try {
            const response = await fetch(`${SERVER}/api/auth/register_users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName,
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
            Swal.fire(
                language === 'en'
                    ? 'Register Successfully!'
                    : 'Đăng kí thành công!',
                language === 'en'
                    ? 'Add successful users!'
                    : 'Thêm người dùng thành công!',
                'success',
            ).then((result) => {
                if (result.isConfirmed) {
                    setUserName('');
                    setName('');
                    setEmail('');
                }
            });
        } catch (error) {
            console.error('Lỗi khi đăng kí:', error.message);
            Swal.fire(
                language === 'en' ? 'Register Failed!' : 'Đăng kí thất bại!',
                error.message,
                'error',
            );
        }
    };
    return (
        <>
            <Row>
                <Col md="12">
                    <Card>
                        <CardHeader>
                            <h5 className="title">
                                {language === 'en'
                                    ? 'Add User'
                                    : 'Thêm người dùng'}
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
                                                id="fullname"
                                                type="text"
                                                placeholder={
                                                    language === 'en'
                                                        ? 'Full name'
                                                        : 'Tên'
                                                }
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col className="px-md-1" md="5">
                                        <FormGroup>
                                            <label>Username</label>
                                            <Input
                                                id="username"
                                                placeholder="Username"
                                                type="text"
                                                value={userName}
                                                onChange={(e) =>
                                                    setUserName(e.target.value)
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
                                                id="email"
                                                placeholder="Email "
                                                type="email"
                                                value={email}
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
                                                placeholder={
                                                    language === 'en'
                                                        ? 'Role'
                                                        : 'Quyền'
                                                }
                                                type="text"
                                                value={'User'}
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
                                onClick={handleRegister}
                            >
                                {language === 'en' ? 'Add' : 'Thêm'}
                            </Button>
                        </CardFooter>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default AddUser;
