import { authApi } from 'configs/Apis';
import { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Row,
    Col,
    Table,
} from 'reactstrap';
import Swal from 'sweetalert2';
import { SERVER } from 'configs/Apis';
function ListUser({ language }) {
    const [list, setList] = useState();
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await authApi().get('/api/user');
            setList(data);
        } catch (error) {
            console.error('Error', error);
        }
    };
    const handleDelete = async (userId) => {
        Swal.fire({
            title:
                language === 'en' ? 'Are you sure?' : 'Bạn có chắc chắn không?',
            text:
                language === 'en'
                    ? 'Do you want to delete this user?'
                    : 'Bạn có muốn xóa người dùng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser(userId);
            }
        });
    };
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${SERVER}/api/user?id=${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the user');
            }
            fetchUsers();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    console.log(language);
    return (
        <Row>
            <Col md="12">
                <Card>
                    <CardHeader>
                        <CardTitle tag="h4">
                            {' '}
                            {language === 'en'
                                ? 'List user'
                                : 'Danh sách người dùng'}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        <Table className="tablesorter" responsive>
                            <thead className="text-primary">
                                <tr>
                                    <th>
                                        {language === 'en' ? 'Name' : 'Tên'}
                                    </th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th className="text-center">
                                        {language === 'en' ? 'Roles' : 'Quyền'}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {list &&
                                Array.isArray(list) &&
                                list.length > 0 ? (
                                    list.map((item) => (
                                        <tr key={item.userid}>
                                            <td>{item.name}</td>
                                            <td>{item.username}</td>
                                            <td>{item.email}</td>
                                            <td className="text-center">
                                                {item.roles}
                                            </td>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                    handleDelete(item.userid)
                                                }
                                            >
                                                {language === 'en'
                                                    ? 'Delete'
                                                    : 'Xóa'}
                                            </button>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    );
}

export default ListUser;
