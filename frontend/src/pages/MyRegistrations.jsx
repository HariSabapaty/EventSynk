import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyRegistrations = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      axiosInstance.get(`/events/users/${user.id}/registrations`)
        .then(res => {
          setRegistrations(res.data.registrations);
          setLoading(false);
        })
        .catch(() => {
          setRegistrations([]);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container">
      <div className="page-header">
        <h2>📋 My Registrations</h2>
        <p>Events you've registered for</p>
      </div>
      
      {loading ? (
        <div className="loading">Loading your registrations</div>
      ) : registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>📭 No Registrations Yet</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            You haven't registered for any events yet. Browse events and join one!
          </p>
          <Link to="/">
            <button>🎉 Explore Events</button>
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {registrations.map(reg => (
            <div key={reg.event_id} className="event-item">
              <div>
                <Link to={`/events/${reg.event_id}`}>{reg.event_title}</Link>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                  <span>📅 {new Date(reg.event_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>✅ Registered</span>
                </div>
              </div>
              <Link to={`/events/${reg.event_id}`}>
                <button type="button">View Details →</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
