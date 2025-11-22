import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CallToAction = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleGetStarted = () => {
    if (user) {
      navigate('/create');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-headline">Ready to host your next SSN college event?</h2>
          <p className="cta-subtext">
            Join EventSynk and make your event a success with seamless registration and management.
          </p>
          <button className="cta-button" onClick={handleGetStarted}>
            <span>Get Started</span>
            <svg
              className="cta-button-icon"
              width="20"
              height="20"
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

          {!user && (
            <p className="cta-login-text">
              Already have an account?{' '}
              <button className="cta-login-link" onClick={() => navigate('/login')}>
                Log in
              </button>
            </p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="cta-decoration">
          <div className="cta-decoration-circle cta-decoration-circle-1"></div>
          <div className="cta-decoration-circle cta-decoration-circle-2"></div>
          <div className="cta-decoration-circle cta-decoration-circle-3"></div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
