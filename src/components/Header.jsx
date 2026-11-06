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
          to="/hospitals" 
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Hospitals
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
          My Appointments
        </NavLink>
        {user && (
          <NavLink 
            to="/profile" 
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            My Profile
          </NavLink>
        )}
        {user && user.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => (isActive ? 'active admin-link' : 'admin-link')}
          >
            ⚙️ Admin
          </NavLink>
        )}
      </nav>

      <div className="auth-section">
        {user ? (
          <div className="user-logged-in">
            <Link to="/profile" className="user-profile-header-link" title="Open My Profile">
              <div className="header-avatar-circle">
                {user.avatar ? (
                  user.avatar.length <= 4 ? (
                    <span className="avatar-emoji">{user.avatar}</span>
                  ) : (
                    <img src={user.avatar} alt="Profile" className="avatar-img" />
                  )
                ) : (
                  <span className="avatar-initials">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
                  </span>
                )}
              </div>
              <div className="header-user-meta">
                <span className="user-greeting">Hi, {user.fullName ? user.fullName.split(' ')[0] : 'Patient'}</span>
                <span className="header-role-pill">Patient</span>
              </div>
            </Link>
            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
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
