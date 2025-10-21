import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '700', marginRight: '1rem' }}>
          ✨ EventSynk
        </Link>
        {user && (
          <>
            <Link to="/create">📝 Create Event</Link>
            <Link to="/my-events">🎯 My Events</Link>
            <Link to="/my-registrations">📋 My Registrations</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <span>👋 {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
