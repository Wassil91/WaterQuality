import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './navbar.css'; // Ensure this is the correct path to your CSS file

function Menubar() {
  const [isNavOpen, setNavOpen] = useState(false);

  const handleToggle = () => setNavOpen(!isNavOpen);

  return (
    <Navbar className="navbar-water-theme" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/accueil" className="logo">
          <h3>EauClaire</h3>
        </Navbar.Brand>
        <button className="navbar-toggler" type="button" onClick={handleToggle}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`navbar-collapse ${isNavOpen ? 'show' : ''}`} id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/accueil" className="nav-link" onClick={() => setNavOpen(false)}>
              Accueil
              <div className="liquid"></div>
            </Nav.Link>
            <Nav.Link as={Link} to="/infoMap" className="nav-link" onClick={() => setNavOpen(false)}>
              InfoMap
              <div className="liquid"></div>
            </Nav.Link>
            <Nav.Link as={Link} to="/consoTable" className="nav-link" onClick={() => setNavOpen(false)}>
              ConsoTable
              <div className="liquid"></div>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard" className="nav-link" onClick={() => setNavOpen(false)}>
              Dashboard
              <div className="liquid"></div>
            </Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}

export default Menubar;
