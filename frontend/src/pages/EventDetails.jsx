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
  const [isRegistered, setIsRegistered] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

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

  // Check if user is already registered for this event
  useEffect(() => {
    if (user && id) {
      axiosInstance.get(`/events/users/${user.id}/registrations`)
        .then(res => {
          const registrations = res.data.registrations || [];
          const alreadyRegistered = registrations.some(reg => reg.event_id === parseInt(id));
          setIsRegistered(alreadyRegistered);
        })
        .catch(() => {
          setIsRegistered(false);
        });
    }
  }, [user, id]);

  // Fetch participants if user is the organizer
  useEffect(() => {
    if (user && event && user.id === event.organiser_id) {
      setLoadingParticipants(true);
      axiosInstance.get(`/events/${id}/participants`)
        .then(res => {
          setParticipants(res.data.participants || []);
          setLoadingParticipants(false);
        })
        .catch(() => {
          setParticipants([]);
          setLoadingParticipants(false);
        });
    }
  }, [user, event, id]);

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

  if (!event) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading event details...
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        {/* Left Column - Event Information */}
        <div className="event-details-left">
          <div className="event-details-header">
            <div className="event-category-badge">{event.category || 'Event'}</div>
            <h1 className="event-details-title">{event.title}</h1>
            <div className="event-organizer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Organized by <strong>{event.organiser}</strong></span>
            </div>
          </div>

          <button 
            onClick={() => setShowPosterModal(true)} 
            className="view-poster-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            View Event Poster
          </button>

          <div className="event-details-section">
            <h3 className="event-section-title">About This Event</h3>
            <p className="event-description">{event.description}</p>
          </div>

          <div className="event-details-grid">
            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="event-detail-content">
                <div className="event-detail-label">Event Date</div>
                <div className="event-detail-value">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </div>
                <div className="event-detail-time">
                  {new Date(event.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                  <path d="M12 6v6l4 2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="event-detail-content">
                <div className="event-detail-label">Registration Deadline</div>
                <div className="event-detail-value">
                  {new Date(event.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="event-detail-time">
                  {new Date(event.deadline).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="event-detail-content">
                <div className="event-detail-label">Participants</div>
                <div className="event-detail-value">{event.registration_count}</div>
                <div className="event-detail-time">Registered</div>
              </div>
            </div>

            {/* Event Mode */}
            {event.mode && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {event.mode === 'Online' ? (
                      <>
                        <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3" strokeLinecap="round"/>
                      </>
                    )}
                  </svg>
                </div>
                <div className="event-detail-content">
                  <div className="event-detail-label">Event Mode</div>
                  <div className="event-detail-value">{event.mode}</div>
                  {event.mode === 'Offline' && event.venue && (
                    <div className="event-detail-time">{event.venue}</div>
                  )}
                </div>
              </div>
            )}

            {/* Participation Type */}
            {event.participation_type && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {event.participation_type === 'Individual' ? (
                      <>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M17 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 21v-2a4 4 0 013-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                </div>
                <div className="event-detail-content">
                  <div className="event-detail-label">Participation</div>
                  <div className="event-detail-value">{event.participation_type}</div>
                  {event.participation_type === 'Team' && event.team_size && (
                    <div className="event-detail-time">Max {event.team_size} members per team</div>
                  )}
                </div>
              </div>
            )}

            {event.prizes && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="7" strokeLinecap="round"/>
                    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="event-detail-content">
                  <div className="event-detail-label">Prizes</div>
                  <div className="event-detail-value">{event.prizes}</div>
                </div>
              </div>
            )}

            {event.eligibility && (
              <div className="event-detail-card event-detail-card-wide">
                <div className="event-detail-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="event-detail-content">
                  <div className="event-detail-label">Eligibility Criteria</div>
                  <div className="event-detail-value event-detail-multiline">{event.eligibility}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="event-details-right">
          <div className="event-registration-card">
            {user ? (
              // Check if current user is the organizer
              user.id === event.organiser_id ? (
                <div className="registration-organizer-message">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
                    <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
                  </svg>
                  <h3>You're the Organizer</h3>
                  <p>As the event organizer, you cannot register for your own event. View your registered participants below.</p>
                  <button 
                    onClick={() => navigate('/my-events')} 
                    className="organizer-dashboard-btn"
                  >
                    Go to My Events
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Participants List */}
                  <div className="participants-section">
                    <div className="participants-header">
                      <h3>Registered Participants ({participants.length})</h3>
                    </div>
                    
                    {loadingParticipants ? (
                      <div className="participants-loading">
                        <div className="btn-spinner"></div>
                        <span>Loading participants...</span>
                      </div>
                    ) : participants.length > 0 ? (
                      <div className="participants-list">
                        {participants.map((participant, index) => (
                          <div key={index} className="participant-card">
                            <div className="participant-header">
                              <div className="participant-avatar">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div className="participant-info">
                                <h4>{participant.name}</h4>
                                <p>{participant.email}</p>
                              </div>
                            </div>
                            {participant.fields && participant.fields.length > 0 && (
                              <div className="participant-fields">
                                {participant.fields.map((field, fieldIndex) => (
                                  <div key={fieldIndex} className="participant-field">
                                    <span className="field-label">{field.field_name}:</span>
                                    <span className="field-value">{field.response_value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-participants">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>No participants yet</p>
                        <span>Participants will appear here once they register</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : isRegistered ? (
                // User is already registered
                <div className="registration-already-registered">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  </svg>
                  <h3>Already Registered</h3>
                  <p>You've successfully registered for this event. Check your registrations to view details or manage your participation.</p>
                  <button 
                    onClick={() => navigate('/my-registrations')} 
                    className="view-registrations-btn"
                  >
                    View My Registrations
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ) : (
                // Show registration form
                <>
                  <div className="registration-card-header">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/>
                    </svg>
                    <h2>Register for Event</h2>
                  </div>
                  <p className="registration-card-subtitle">
                    Fill in the details below to secure your spot
                  </p>

                  <form onSubmit={handleRegister} className="registration-form">
                  {fields.length > 0 ? (
                    <div className="registration-fields">
                      {fields.map(field => (
                        <div key={field.id} className="registration-field-group">
                          <label className="registration-field-label">
                            {field.field_name}
                            {field.is_required && <span className="required-star">*</span>}
                          </label>
                          <input
                            type={field.field_type}
                            required={field.is_required}
                            placeholder={`Enter ${field.field_name.toLowerCase()}`}
                            className="registration-field-input"
                            pattern={
                              field.field_name.toLowerCase().includes('mobile') || 
                              field.field_name.toLowerCase().includes('phone') ||
                              field.field_name.toLowerCase().includes('roll') ||
                              field.field_name.toLowerCase().includes('number')
                              ? '[0-9]+' 
                              : undefined
                            }
                            title={
                              field.field_name.toLowerCase().includes('mobile') || 
                              field.field_name.toLowerCase().includes('phone') ||
                              field.field_name.toLowerCase().includes('roll') ||
                              field.field_name.toLowerCase().includes('number')
                              ? 'Please enter numbers only' 
                              : undefined
                            }
                            onChange={e => {
                              const value = e.target.value;
                              setResponses(prev => {
                                const filtered = prev.filter(r => r.field_id !== field.id);
                                return [...filtered, { field_id: field.id, response_value: value }];
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-fields-message">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/>
                      </svg>
                      <p>No additional information required</p>
                      <span>Click register to confirm your participation</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="registration-submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/>
                        </svg>
                        Register Now
                      </>
                    )}
                  </button>
                </form>
                </>
              )
            ) : (
              <div className="registration-login-required">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
                </svg>
                <h3>Login Required</h3>
                <p>Please sign in to register for this event</p>
                <button onClick={() => navigate('/login')} className="login-required-btn">
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Poster Modal */}
      {showPosterModal && (
        <div className="poster-modal-overlay" onClick={() => setShowPosterModal(false)}>
          <div className="poster-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="poster-modal-close" 
              onClick={() => setShowPosterModal(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <img 
              src={event.poster_url || `https://via.placeholder.com/800x450/0A21C0/FFFFFF?text=${encodeURIComponent(event.title)}`}
              alt={event.title}
              className="poster-modal-image"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/800x450/0A21C0/FFFFFF?text=${encodeURIComponent(event.title)}`;
              }}
            />
            <div className="poster-modal-title">{event.title}</div>
          </div>
        </div>
      )}
      
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default EventDetails;
