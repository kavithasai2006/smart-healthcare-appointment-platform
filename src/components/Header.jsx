import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        🏥 <span>SmartCare</span>
      </Link>

      <nav className="navbar">
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Home
        </NavLink>
        <NavLink 
          to="/doctors" 
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Doctors
        </NavLink>
        <NavLink 
          to="/appointments" 
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Appointments
        </NavLink>
      </nav>

      <div className="auth-section">
        {user ? (
          <div className="user-logged-in">
            <span className="user-greeting">Hi, {user.fullName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
