import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="navbar-logo-icon">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.8"/>
            <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
          </svg>
          <span className="navbar-logo-text">EventSynk</span>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <div className="navbar-links">
            <Link 
              to="/events" 
              className={`navbar-link ${isActive('/events') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
              All Events
            </Link>
            <Link 
              to="/create" 
              className={`navbar-link ${isActive('/create') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              Create Event
            </Link>
            <Link 
              to="/my-events" 
              className={`navbar-link ${isActive('/my-events') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
              My Events
            </Link>
            <Link 
              to="/my-registrations" 
              className={`navbar-link ${isActive('/my-registrations') ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/>
              </svg>
              Registrations
            </Link>
          </div>
        )}

        {/* Desktop Auth Actions */}
        <div className="navbar-actions">
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <Link to="/login" className="navbar-btn navbar-btn-ghost">
              Login
            </Link>
            <Link to="/register" className="navbar-btn navbar-btn-primary">
              Sign Up
            </Link>
          </SignedOut>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {user && (
            <div className="navbar-mobile-links">
              <Link 
                to="/events" 
                className={`navbar-mobile-link ${isActive('/events') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
                </svg>
                All Events
              </Link>
              <Link 
                to="/create" 
                className={`navbar-mobile-link ${isActive('/create') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
                Create Event
              </Link>
              <Link 
                to="/my-events" 
                className={`navbar-mobile-link ${isActive('/my-events') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
                </svg>
                My Events
              </Link>
              <Link 
                to="/my-registrations" 
                className={`navbar-mobile-link ${isActive('/my-registrations') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/>
                </svg>
                Registrations
              </Link>
            </div>
          )}
          <div className="navbar-mobile-actions">
            {user ? (
              <>
                <div className="navbar-user-mobile">
                  <div className="navbar-user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="navbar-user-name">{user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-btn navbar-btn-ghost navbar-btn-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="navbar-btn navbar-btn-primary navbar-btn-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
