import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import ToastNotification from '../components/ToastNotification';
import * as XLSX from 'xlsx';

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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/events/${id}`)
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
      axiosInstance
        .get(`/events/users/${user.id}/registrations`)
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
      axiosInstance
        .get(`/events/${id}/participants`)
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

  const exportToExcel = () => {
    if (participants.length === 0) {
      setMessage('No participants to export');
      setMessageType('info');
      return;
    }

    // Prepare data for Excel
    const excelData = participants.map((participant, index) => {
      const row = {
        'S.No': index + 1,
        Name: participant.name,
        Email: participant.email,
      };

      // Add custom fields
      if (participant.fields && participant.fields.length > 0) {
        participant.fields.forEach(field => {
          row[field.field_name] = field.response_value;
        });
      }

      return row;
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    // Generate filename with event title and date
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_')}_Participants_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    setMessage('Participant list exported successfully!');
    setMessageType('success');
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(`/events/${id}/register`, { responses });
      setMessage('Registered successfully! 🎉');
      setMessageType('success');
      setLoading(false);
      setShowRegistrationModal(false);
      setTimeout(() => navigate('/my-registrations'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setMessageType('error');
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: '1.2rem',
          color: '#666',
        }}
      >
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                Organized by{' '}
                <strong
                  className="organizer-name-tooltip"
                  title={event.organiser_email || 'Email not available'}
                >
                  {event.organiser}
                </strong>
              </span>
            </div>
          </div>

          <div className="event-action-buttons">
            <button onClick={() => setShowPosterModal(true)} className="view-poster-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              View Event Poster
            </button>

            {/* Registration button */}
            {user && user.id !== event.organiser_id && !isRegistered && (
              <button onClick={() => setShowRegistrationModal(true)} className="register-event-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                    strokeLinecap="round"
                  />
                </svg>
                Register for Event
              </button>
            )}
          </div>

          <div className="event-details-section">
            <h3 className="event-section-title">About This Event</h3>
            <p className="event-description">{event.description}</p>
          </div>

          <div className="event-details-grid">
            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                </svg>
              </div>
              <div className="event-detail-content">
                <span className="event-detail-label">Event Date:</span>
                <span className="event-detail-value">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="event-detail-content">
                <span className="event-detail-label">Registration Deadline:</span>
                <span className="event-detail-value">
                  {new Date(event.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="event-detail-card">
              <div className="event-detail-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="event-detail-content">
                <span className="event-detail-label">Participants:</span>
                <span className="event-detail-value">{event.current_participants} Registered</span>
              </div>
            </div>

            {/* Event Mode */}
            {event.mode && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {event.mode === 'Online' ? (
                      <>
                        <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                        <path
                          d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="3" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </div>
                <div className="event-detail-content">
                  <span className="event-detail-label">Event Mode:</span>
                  <span className="event-detail-value">
                    {event.mode}
                    {event.mode === 'Offline' && event.venue && ` • ${event.venue}`}
                  </span>
                </div>
              </div>
            )}

            {/* Participation Type */}
            {event.participation_type && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {event.participation_type === 'Individual' ? (
                      <>
                        <path
                          d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    ) : (
                      <>
                        <path
                          d="M17 21v-2a4 4 0 00-3-3.87"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 21v-2a4 4 0 013-3.87"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path
                          d="M23 21v-2a4 4 0 00-3-3.87"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 3.13a4 4 0 010 7.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                </div>
                <div className="event-detail-content">
                  <span className="event-detail-label">Participation:</span>
                  <span className="event-detail-value">
                    {event.participation_type}
                    {event.participation_type === 'Team' &&
                      event.team_size &&
                      ` • Max ${event.team_size} members per team`}
                  </span>
                </div>
              </div>
            )}

            {event.prizes && (
              <div className="event-detail-card">
                <div className="event-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="8" r="7" strokeLinecap="round" />
                    <path
                      d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="event-detail-content">
                  <span className="event-detail-label">Prizes:</span>
                  <span className="event-detail-value">{event.prizes}</span>
                </div>
              </div>
            )}

            {event.eligibility && (
              <div className="event-detail-card event-detail-card-wide">
                <div className="event-detail-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M22 11.08V12a10 10 0 11-5.93-9.14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="event-detail-content">
                  <span className="event-detail-label">Eligibility:</span>
                  <span className="event-detail-value">{event.eligibility}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List for Organizer */}
        {user && user.id === event.organiser_id && (
          <div className="participants-section-fullwidth">
            <div className="participants-header">
              <h3>Registered Participants ({participants.length})</h3>
              {participants.length > 0 && (
                <button onClick={exportToExcel} className="export-excel-btn">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="7 10 12 15 17 10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                  </svg>
                  Export to Excel
                </button>
              )}
            </div>

            {loadingParticipants ? (
              <div className="participants-loading">
                <div className="btn-spinner"></div>
                <span>Loading participants...</span>
              </div>
            ) : participants.length > 0 ? (
              <div className="participants-table-container">
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Name</th>
                      <th>Email</th>
                      {participants[0]?.fields &&
                        participants[0].fields.map((field, idx) => (
                          <th key={idx}>{field.field_name}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="participant-name-cell">
                          <div className="participant-name-wrapper">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle
                                cx="12"
                                cy="7"
                                r="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {participant.name}
                          </div>
                        </td>
                        <td>{participant.email}</td>
                        {participant.fields &&
                          participant.fields.map((field, fieldIdx) => (
                            <td key={fieldIdx}>{field.response_value}</td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-participants">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>No participants yet</p>
                <span>Participants will appear here once they register</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="registration-modal-overlay" onClick={() => setShowRegistrationModal(false)}>
          <div className="registration-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="registration-modal-close"
              onClick={() => setShowRegistrationModal(false)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="registration-modal-header">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                  strokeLinecap="round"
                />
              </svg>
              <h2>Register for Event</h2>
              <p>Fill in the details below to secure your spot</p>
            </div>

            <form onSubmit={handleRegister} className="registration-modal-form">
              {fields.length > 0 ? (
                <div className="registration-modal-fields">
                  {fields.map(field => (
                    <div key={field.id} className="registration-modal-field-group">
                      <label className="registration-modal-field-label">
                        {field.field_name}
                        {field.is_required && <span className="required-star">*</span>}
                      </label>
                      <input
                        type={field.field_type}
                        required={field.is_required}
                        placeholder={`Enter ${field.field_name.toLowerCase()}`}
                        className="registration-modal-field-input"
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
                <div className="no-fields-message-modal">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p>No additional information required</p>
                  <span>Click register to confirm your participation</span>
                </div>
              )}

              <div className="registration-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="registration-modal-cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="registration-modal-submit-btn">
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                        <path
                          d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                          strokeLinecap="round"
                        />
                      </svg>
                      Register Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Poster Modal */}
      {showPosterModal && (
        <div className="poster-modal-overlay" onClick={() => setShowPosterModal(false)}>
          <div className="poster-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="poster-modal-close"
              onClick={() => setShowPosterModal(false)}
              aria-label="Close modal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {event.poster_url ? (
              <img
                src={event.poster_url}
                alt={event.title}
                className="poster-modal-image"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="no-poster-message">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <p>No Poster Available</p>
                <span>This event doesn&apos;t have a poster image</span>
              </div>
            )}

            <div className="no-poster-fallback" style={{ display: 'none' }}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p>No Poster Available</p>
              <span>Failed to load the poster image</span>
            </div>

            <div className="poster-modal-title">{event.title}</div>
          </div>
        </div>
      )}

      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default EventDetails;
