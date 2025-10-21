import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import ToastNotification from '../components/ToastNotification';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [fields, setFields] = useState([]);
  const [responses, setResponses] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get(`/events/${id}`)
      .then(res => {
        setEvent(res.data.event);
        setFields(res.data.event.fields);
      })
      .catch(() => {
        setMessage('Failed to load event');
        setMessageType('error');
      });
  }, [id]);

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(`/events/${id}/register`, { responses });
      setMessage('Registered successfully! 🎉');
      setMessageType('success');
      setLoading(false);
      setTimeout(() => navigate('/my-registrations'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setMessageType('error');
      setLoading(false);
    }
  };

  if (!event) return <div className="loading">Loading event details</div>;

  return (
    <div className="event-details">
      <img 
        src={event.poster_url || 'https://via.placeholder.com/900x400/A6B1E1/FFFFFF?text=Event+Banner'} 
        alt={event.title}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/900x400/A6B1E1/FFFFFF?text=Event+Banner';
        }}
      />
      <h2>{event.title}</h2>
      <p style={{ fontSize: '1.2rem', color: 'var(--color-text)' }}>{event.description}</p>
      
      <div className="event-info-grid">
        <div className="event-info-item">
          <strong>📅 Event Date</strong>
          <span>{new Date(event.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        <div className="event-info-item">
          <strong>⏰ Registration Deadline</strong>
          <span>{new Date(event.deadline).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
        {event.prizes && (
          <div className="event-info-item">
            <strong>🏆 Prizes</strong>
            <span>{event.prizes}</span>
          </div>
        )}
        {event.eligibility && (
          <div className="event-info-item">
            <strong>✅ Eligibility</strong>
            <span>{event.eligibility}</span>
          </div>
        )}
        <div className="event-info-item">
          <strong>👤 Organizer</strong>
          <span>{event.organiser}</span>
        </div>
        <div className="event-info-item">
          <strong>👥 Registrations</strong>
          <span>{event.registration_count} participants</span>
        </div>
      </div>

      {user ? (
        <div className="card" style={{ marginTop: '2rem' }}>
          <form onSubmit={handleRegister}>
            <h3>📝 Register for this Event</h3>
            {fields.length > 0 ? (
              fields.map(field => (
                <div key={field.id}>
                  <label>
                    {field.field_name} {field.is_required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                  </label>
                  <input
                    type={field.field_type}
                    required={field.is_required}
                    placeholder={`Enter ${field.field_name.toLowerCase()}`}
                    onChange={e => {
                      const value = e.target.value;
                      setResponses(prev => {
                        const filtered = prev.filter(r => r.field_id !== field.id);
                        return [...filtered, { field_id: field.id, response_value: value }];
                      });
                    }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-light)', textAlign: 'center' }}>
                No additional information required
              </p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : '✨ Register Now'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
          <h3>🔐 Login Required</h3>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            Please login to register for this event
          </p>
          <button onClick={() => navigate('/login')}>Login</button>
        </div>
      )}
      
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default EventDetails;
