import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyRegistrations = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [fullEvents, setFullEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Fetch registrations
      axiosInstance.get(`/events/users/${user.id}/registrations`)
        .then(res => {
          setRegistrations(res.data.registrations);
          // Fetch full details for each event
          const eventPromises = res.data.registrations.map(reg => 
            axiosInstance.get(`/events/${reg.event_id}`)
              .then(response => response.data.event)
              .catch(() => null)
          );
          return Promise.all(eventPromises);
        })
        .then(detailedEvents => {
          setFullEvents(detailedEvents.filter(e => e !== null));
          setLoading(false);
        })
        .catch(() => {
          setRegistrations([]);
          setFullEvents([]);
          setLoading(false);
        });
    }
  }, [user]);

  // Filter events based on search
  const filteredEvents = fullEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organiser && event.organiser.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="all-events-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>My Registrations</h1>
          <p>Events you've registered for</p>
        </div>

        {/* Search Bar */}
        {!loading && fullEvents.length > 0 && (
          <div className="events-filters">
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search registered events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Events Count */}
        {!loading && fullEvents.length > 0 && (
          <div className="events-count">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'registration' : 'registrations'} found
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your registrations...</p>
          </div>
        ) : fullEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>No registrations yet</h3>
            <p>You haven't registered for any events yet. Browse events and join one!</p>
            <Link to="/events">
              <button className="btn-primary">Explore Events</button>
            </Link>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>No events found</h3>
            <p>Try adjusting your search</p>
            <button 
              className="btn-primary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="event-list">
            {filteredEvents.map(event => (
              <RegistrationEventCard 
                key={event.id} 
                event={event} 
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RegistrationEventCard = ({ event, formatDate }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time remaining until registration deadline
  const getDeadlineStatus = () => {
    if (!event.deadline) {
      return { text: 'No Deadline', className: 'deadline-open', urgent: false };
    }

    const now = new Date();
    const deadline = new Date(event.deadline);
    
    // Check if deadline is valid
    if (isNaN(deadline.getTime())) {
      return { text: 'Invalid Date', className: 'deadline-open', urgent: false };
    }

    const diffMs = deadline - now;
    
    if (diffMs <= 0) {
      return { text: 'Registration Closed', className: 'deadline-closed', urgent: false };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 24) {
      return { 
        text: `${diffHours}h left`, 
        className: 'deadline-urgent',
        urgent: true 
      };
    } else if (diffDays < 7) {
      return { 
        text: `${diffDays}d left`, 
        className: 'deadline-soon',
        urgent: diffDays <= 2 
      };
    } else {
      return { 
        text: `${diffDays}d left`, 
        className: 'deadline-open',
        urgent: false 
      };
    }
  };

  const deadlineStatus = getDeadlineStatus();
  const category = event.category || 'Campus Event';

  return (
    <div className="featured-card registration-event-card">
      <div className="featured-card-image-wrapper">
        <img 
          src={event.poster_url || `https://via.placeholder.com/400x240/0A21C0/FFFFFF?text=${encodeURIComponent(event.title)}`}
          alt={event.title}
          className="featured-card-image"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x240/0A21C0/FFFFFF?text=${encodeURIComponent(event.title)}`;
          }}
        />
        <div className="featured-card-badge">{category}</div>
        {/* Registration Deadline Badge */}
        <div className={`featured-deadline-badge ${deadlineStatus.className}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
            <path d="M12 6v6l4 2" strokeLinecap="round"/>
          </svg>
          {deadlineStatus.text}
        </div>
        {/* Registered Badge */}
        <div className="registration-status-badge">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          Registered
        </div>
      </div>
      
      <div className="featured-card-content">
        <h3 className="featured-card-title">{event.title}</h3>
        
        {/* Event Date */}
        <div className="featured-card-meta">
          <div className="featured-card-meta-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="featured-card-meta-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
              <path d="M12 6v6l4 2" strokeLinecap="round"/>
            </svg>
            <span>{formatTime(event.date)}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="featured-card-meta">
          <div className="featured-card-meta-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{event.organiser_name || 'Unknown'}</span>
          </div>
        </div>

        {/* Registration Count */}
        <div className="featured-card-meta">
          <div className="featured-card-meta-item">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{event.registration_count || 0} {(event.registration_count || 0) === 1 ? 'Registration' : 'Registrations'}</span>
          </div>
        </div>

        {/* Additional Info Badges */}
        <div className="featured-card-badges">
          {event.mode && (
            <span className="featured-info-badge">
              {event.mode === 'Online' ? '🌐' : '📍'} {event.mode}
            </span>
          )}
          {event.participation_type && (
            <span className="featured-info-badge">
              {event.participation_type === 'Individual' ? '👤' : '👥'} {event.participation_type}
            </span>
          )}
        </div>

        <Link 
          to={`/events/${event.id}`}
          className="featured-card-button"
        >
          View Details
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default MyRegistrations;
