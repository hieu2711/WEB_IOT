import React from 'react';
import { useSelector } from 'react-redux';

// reactstrap components
import { Container, Nav, NavItem, NavLink } from 'reactstrap';

function Footer() {
    const language = useSelector((state) => state.language.language);
    return (
        <footer className="footer">
            <Container fluid>
                <Nav>
                    <NavItem>
                        <NavLink>HT_Team</NavLink>
                    </NavItem>
                </Nav>
                <div className="copyright">
                    {language === 'en' ? (
                        <>
                            © {new Date().getFullYear()} made with{' '}
                            <i className="tim-icons icon-heart-2" /> by{' '}
                            <a href="https://github.com/">HT_Team</a>
                        </>
                    ) : (
                        <>
                            © {new Date().getFullYear()} Thực hiện{' '}
                            <i className="tim-icons icon-heart-2" /> bởi{' '}
                            <a href="https://github.com/">HT_Team</a>
                        </>
                    )}
                </div>
            </Container>
        </footer>
    );
}

export default Footer;
