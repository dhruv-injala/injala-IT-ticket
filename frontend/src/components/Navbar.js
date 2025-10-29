import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/Shield.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "IT Admin";

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{
        backgroundColor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{ color: "#9950FF" }}
        >
          <img src={logo} alt="Logo" style={{ height: "30px" }} className="me-2"/>
          Injala IT Support
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i> Dashboard
              </Link>
            </li>
            {user?.role === "Employee" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-tickets">
                    <i className="bi bi-list-ul me-1"></i> My Tickets
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-ticket">
                    <i className="bi bi-plus-circle me-1"></i> Create Ticket
                  </Link>
                </li>
              </>
            )}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    <i className="bi bi-speedometer2 me-1"></i> Admin Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/audit-logs">
                    <i className="bi bi-journal-text me-1"></i> Audit Logs
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <span className="me-3 text-muted">
              <i className="bi bi-person-circle me-1"></i>
              {user?.name} ({user?.role})
            </span>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
