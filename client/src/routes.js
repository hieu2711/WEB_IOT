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
    },
    {
        path: '/statistical',
        name: 'Statistical',
        icon: 'tim-icons icon-chart-bar-32',
        component: <Statistical />,
        layout: '/admin',
    },
    {
        path: '/user-profile',
        name: 'User Profile',
        icon: 'tim-icons icon-single-02',
        component: <UserProfile />,
        layout: '/admin',
    },
    {
        path: '/user-management',
        name: 'User Management',
        icon: 'tim-icons icon-pencil',
        component: <UserManagement />,
        layout: '/admin',
    },
    {
        path: '/',
        name: 'Sign-in',
        icon: 'tim-icons icon-key-25',
        component: <Login />,
        layout: '/sign-in',
    },
    {
        path: '/',
        name: 'Sign-up',
        icon: 'tim-icons icon-double-right',
        component: <Register />,
        layout: '/sign-up',
    },
];
export default routes;
