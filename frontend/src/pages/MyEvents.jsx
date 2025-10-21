import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const MyEvents = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      axiosInstance.get(`/events/users/${user.id}/events`)
        .then(res => {
          setEvents(res.data.events);
          setLoading(false);
        })
        .catch(() => {
          setEvents([]);
          setLoading(false);
        });
    }
  }, [user]);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axiosInstance.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setMessage('Event deleted successfully! 🗑️');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
      setMessageType('error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>🎯 My Events</h2>
        <p>Manage all your created events</p>
      </div>
      
      {loading ? (
        <div className="loading">Loading your events</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>📭 No Events Yet</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            You haven't created any events yet. Start by creating your first event!
          </p>
          <Link to="/create">
            <button>✨ Create Your First Event</button>
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {events.map(event => (
            <div key={event.id} className="event-item">
              <div>
                <Link to={`/events/${event.id}`}>{event.title}</Link>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                  <span>📅 {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                  <span>👥 {event.registration_count} registrations</span>
                </div>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(event.id)}>
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
      
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default MyEvents;
