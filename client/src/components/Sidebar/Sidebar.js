import React, { useEffect, useState } from 'react';
import { NavLink, Link, Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import PerfectScrollbar from 'perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../reducers/userSlice';
import { Nav } from 'reactstrap';
import { BackgroundColorContext } from 'contexts/BackgroundColorContext';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

var ps;

function Sidebar(props) {
    const sidebarRef = React.useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const [isViewer, setIsViewer] = useState(null);
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.language);
    const { t } = useTranslation();

    React.useEffect(() => {
        if (navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(sidebarRef.current, {
                suppressScrollX: true,
                suppressScrollY: false,
            });
        }
        // Cleanup PerfectScrollbar on unmount
        return function cleanup() {
            if (navigator.platform.indexOf('Win') > -1) {
                ps.destroy();
            }
        };
    }, []);
    const checkTokenExpiration = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const tokenExpTime = tokenPayload.exp * 1000;
        const currentTime = Date.now();
        if (currentTime > tokenExpTime) {
            handleLogout(); 
            showSessionExpiredAlert();
        }
    };
    useEffect(() => {
        const interval = setInterval(checkTokenExpiration, 1000);
        return () => clearInterval(interval);
    }, []);
    const fetchUserDataFromLocalStorage = () => {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('user');

        if (storedIsLoggedIn && storedUser) {
            setIsLoggedIn(JSON.parse(storedIsLoggedIn));
            setIsViewer(JSON.parse(storedUser));
        }
    };
    useEffect(() => {
        fetchUserDataFromLocalStorage();
    }, []);
    const showSessionExpiredAlert = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your login session has expired. Please log in again.',
            confirmButtonText: 'OK',
        });
        setIsLoggedOut(true);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        setIsViewer(null);
        dispatch(logout());
    };

    let logoImg = null;
    let logoText = null;
    logoText = (
        <a
            className="simple-text logo-normal"
            target="_blank"
            onClick={props.toggleSidebar}
        ></a>
    );
    if (isLoggedOut) {
        return <Navigate to="/sign-in/" />;
    }
    return (
        <BackgroundColorContext.Consumer>
            {({ color }) => (
                <div className="sidebar" data={color}>
                    <div className="sidebar-wrapper" ref={sidebarRef}>
                        {logoImg !== null || logoText !== null ? (
                            <div className="logo">
                                {logoImg}
                                {logoText}
                            </div>
                        ) : null}
                        <Nav>
                            <li>
                                <NavLink
                                    to="/admin/dashboard"
                                    className="nav-link"
                                >
                                    <i className="tim-icons icon-chart-pie-36" />
                                    <p>{t('dashboard')}</p>
                                </NavLink>
                            </li>
                            {isLoggedIn &&
                                isViewer &&
                                isViewer.roles !== 'Viewer' && (
                                    <li>
                                        <NavLink
                                            to="/admin/statistical"
                                            className="nav-link"
                                        >
                                            <i className="tim-icons icon-chart-bar-32" />
                                            <p>{t('statistical')}</p>
                                        </NavLink>
                                    </li>
                                )}
                            <li>
                                <NavLink
                                    to="/admin/user-profile"
                                    className="nav-link"
                                >
                                    <i className="tim-icons icon-single-02" />
                                    <p>{t('user_profile')}</p>
                                </NavLink>
                            </li>
                            {isLoggedIn &&
                                isViewer &&
                                isViewer.roles === 'Admin' && (
                                    <li>
                                        <NavLink
                                            to="/admin/user-management"
                                            className="nav-link"
                                        >
                                            <i className="tim-icons icon-chart-bar-32" />
                                            <p>{t('user_management')}</p>
                                        </NavLink>
                                    </li>
                                )}
                            {!isLoggedIn ? (
                                <>
                                    <li>
                                        <NavLink
                                            to="/sign-in"
                                            className="nav-link"
                                        >
                                            <i className="tim-icons icon-key-25" />
                                            <p>{t('sign_in')}</p>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/sign-up"
                                            className="nav-link"
                                        >
                                            <i className="tim-icons icon-double-right" />
                                            <p>{t('sign_up')}</p>
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <NavLink
                                        to="/sign-in"
                                        className="nav-link"
                                        onClick={handleLogout}
                                    >
                                        <i className="tim-icons icon-double-left" />
                                        <p>{t('log_out')}</p>
                                    </NavLink>
                                </li>
                            )}
                        </Nav>
                    </div>
                </div>
            )}
        </BackgroundColorContext.Consumer>
    );
}

Sidebar.propTypes = {
    // if true, then instead of the routes[i].name, routes[i].rtlName will be rendered
    // insde the links of this component
    rtlActive: PropTypes.bool,
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
        // innerLink is for links that will direct the user within the app
        // it will be rendered as <Link to="...">...</Link> tag
        innerLink: PropTypes.string,
        // outterLink is for links that will direct the user outside the app
        // it will be rendered as simple <a href="...">...</a> tag
        outterLink: PropTypes.string,
        // the text of the logo
        text: PropTypes.node,
        // the image src of the logo
        imgSrc: PropTypes.string,
    }),
};

export default Sidebar;
