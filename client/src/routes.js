import Dashboard from 'views/Dashboard.js';
import Statistical from 'views/Statistical.js';
import UserProfile from 'views/UserProfile.js';
import Login from 'layouts/Login/Login';
import Register from 'layouts/Register/Register';
import UserManagement from 'views/UserManagement';
var routes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: 'tim-icons icon-chart-pie-36',
        component: <Dashboard />,
        layout: '/admin',
        vi:'BẢNG ĐIỀU KHIỂN'
    },
    {
        path: '/statistical',
        name: 'Statistical',
        icon: 'tim-icons icon-chart-bar-32',
        component: <Statistical />,
        layout: '/admin',
        vi:'THỐNG KÊ'
    },
    {
        path: '/user-profile',
        name: 'User Profile',
        icon: 'tim-icons icon-single-02',
        component: <UserProfile />,
        layout: '/admin',
        vi:'TRANG CÁ NHÂN'
    },
    {
        path: '/user-management',
        name: 'User Management',
        icon: 'tim-icons icon-settings',
        component: <UserManagement />,
        layout: '/admin',
        vi:'QUẢN LÝ NGƯỜI DÙNG'
    },
    {
        path: '/',
        name: 'Sign-in',
        icon: 'tim-icons icon-key-25',
        component: <Login />,
        layout: '/sign-in',
        vi:'ĐĂNG NHẬP'
    },
    {
        path: '/',
        name: 'Sign-up',
        icon: 'tim-icons icon-double-right',
        component: <Register />,
        layout: '/sign-up',
        vi:'ĐĂNG KÍ'
    },
];
export default routes;
