import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <Link to="/create">Create Event</Link>
          <Link to="/my-events">My Events</Link>
          <Link to="/my-registrations">My Registrations</Link>
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
