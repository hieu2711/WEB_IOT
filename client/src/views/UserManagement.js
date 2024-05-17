import React, { useState } from 'react';
// reactstrap components
import { ButtonGroup } from 'reactstrap';
import ListUser from 'components/ListUser/ListUser';
import AddUser from 'components/AddUser/AddUser';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function UserManagement() {
    const [type, setType] = useState('List');
    const language = useSelector((state) => state.language.language);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        return <Navigate to="/sign-in" />;
    }
    return (
        <>
            <div className="content">
                <div className="d-flex  align-items-center">
                    <ButtonGroup
                        className="btn-group-toggle"
                        data-toggle="buttons"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setType('List');
                            }}
                            className="btn btn-outline-primary"
                        >
                            {language === 'en' ? 'List' : 'Danh sách'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setType('Add');
                            }}
                            className="btn btn-outline-primary"
                        >
                            {language === 'en' ? 'Add' : 'Thêm'}
                        </button>
                    </ButtonGroup>
                </div>
                {(() => {
                    if (type === 'Add') {
                        return <AddUser />;
                    } else {
                        return <ListUser language={language} />;
                    }
                })()}
            </div>
        </>
    );
}

export default UserManagement;
