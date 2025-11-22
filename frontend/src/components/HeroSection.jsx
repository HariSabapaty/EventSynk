import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Gateway to SSN College Events</h1>
            <p className="hero-subtitle">
              Create, discover, and join campus events effortlessly — all in one place.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn hero-btn-primary" onClick={() => navigate('/events')}>
                Explore Events
                <svg
                  className="hero-btn-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
              {user && (
                <button className="hero-btn hero-btn-secondary" onClick={() => navigate('/create')}>
                  Create an Event
                  <svg
                    className="hero-btn-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
              <div className="hero-shape hero-shape-3"></div>
            </div>
            <div className="hero-illustration">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar Icon */}
                <rect
                  x="80"
                  y="100"
                  width="240"
                  height="220"
                  rx="12"
                  fill="url(#gradient1)"
                  opacity="0.1"
                />
                <rect x="80" y="100" width="240" height="60" rx="12" fill="url(#gradient2)" />
                <circle cx="140" cy="130" r="8" fill="white" opacity="0.9" />
                <circle cx="200" cy="130" r="8" fill="white" opacity="0.9" />
                <circle cx="260" cy="130" r="8" fill="white" opacity="0.9" />

                {/* Event Cards */}
                <rect x="100" y="180" width="90" height="60" rx="8" fill="#0A21C0" opacity="0.8" />
                <rect x="210" y="180" width="90" height="60" rx="8" fill="#050A44" opacity="0.8" />
                <rect x="100" y="250" width="90" height="60" rx="8" fill="#2C2E3A" opacity="0.8" />
                <rect x="210" y="250" width="90" height="60" rx="8" fill="#0A21C0" opacity="0.6" />

                {/* Trophy */}
                <path
                  d="M160 50 L180 50 L185 70 L155 70 Z M170 70 L170 90 M160 90 L180 90 M165 90 L175 90 L177 100 L163 100 Z"
                  stroke="url(#gradient3)"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.7"
                />

                <defs>
                  <linearGradient id="gradient1" x1="80" y1="100" x2="320" y2="320">
                    <stop offset="0%" stopColor="#0A21C0" />
                    <stop offset="100%" stopColor="#050A44" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="80" y1="100" x2="320" y2="160">
                    <stop offset="0%" stopColor="#0A21C0" />
                    <stop offset="100%" stopColor="#050A44" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="160" y1="50" x2="180" y2="100">
                    <stop offset="0%" stopColor="#0A21C0" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="hero-particles">
        <div className="hero-particle"></div>
        <div className="hero-particle"></div>
        <div className="hero-particle"></div>
        <div className="hero-particle"></div>
      </div>
    </section>
  );
};

export default HeroSection;
