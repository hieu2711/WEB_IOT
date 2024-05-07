import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';

// reactstrap components
import { NavbarBrand, Navbar, Container, NavbarToggler } from 'reactstrap';

function AdminNavbar(props) {
    const [collapseOpen, setcollapseOpen] = React.useState(false);
    const [color, setcolor] = React.useState('navbar-transparent');
    React.useEffect(() => {
        window.addEventListener('resize', updateColor);
        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateColor);
        };
    });
    // function that adds color white/transparent to the navbar on resize (this is for the collapse)
    const updateColor = () => {
        if (window.innerWidth < 993 && collapseOpen) {
            setcolor('bg-white');
        } else {
            setcolor('navbar-transparent');
        }
    };
    // this function opens and closes the collapse on small devices
    const toggleCollapse = () => {
        if (collapseOpen) {
            setcolor('navbar-transparent');
        } else {
            setcolor('bg-white');
        }
        setcollapseOpen(!collapseOpen);
    };
    return (
        <>
            <Navbar
                className={classNames('navbar-absolute', color)}
                expand="lg"
            >
                <Container fluid>
                    <div className="navbar-wrapper">
                        <div
                            className={classNames('navbar-toggle d-inline', {
                                toggled: props.sidebarOpened,
                            })}
                        >
                            <NavbarToggler onClick={props.toggleSidebar}>
                                <span className="navbar-toggler-bar bar1" />
                                <span className="navbar-toggler-bar bar2" />
                                <span className="navbar-toggler-bar bar3" />
                            </NavbarToggler>
                        </div>
                        <NavbarBrand
                            className="mt-5"
                            onClick={(e) => e.preventDefault()}
                        >
                            {props.brandText}
                        </NavbarBrand>
                    </div>
                    <NavbarToggler onClick={toggleCollapse}>
                        <span className="navbar-toggler-bar navbar-kebab" />
                        <span className="navbar-toggler-bar navbar-kebab" />
                        <span className="navbar-toggler-bar navbar-kebab" />
                    </NavbarToggler>
                </Container>
            </Navbar>
        </>
    );
}

export default AdminNavbar;
