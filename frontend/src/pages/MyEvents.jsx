import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const MyEvents = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [fullEvents, setFullEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Fetch basic events list
      axiosInstance.get(`/events/users/${user.id}/events`)
        .then(res => {
          setEvents(res.data.events);
          // Fetch full details for each event
          const eventPromises = res.data.events.map(event => 
            axiosInstance.get(`/events/${event.id}`)
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
          setEvents([]);
          setFullEvents([]);
          setLoading(false);
        });
    }
  }, [user]);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axiosInstance.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setFullEvents(fullEvents.filter(e => e.id !== id));
      setMessage('Event deleted successfully!');
      setMessageType('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
      setMessageType('error');
    }
  };

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
          <h1>My Events</h1>
          <p>Manage all your created events</p>
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
                placeholder="Search your events..."
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
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your events...</p>
          </div>
        ) : fullEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No events created yet</h3>
            <p>Start by creating your first event!</p>
            <Link to="/create">
              <button className="btn-primary">Create Your First Event</button>
            </Link>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
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
              <MyEventCard 
                key={event.id} 
                event={event} 
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
      
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

const MyEventCard = ({ event, onDelete, formatDate }) => {
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
    <div className="featured-card my-event-card">
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
              {event.mode === 'Online' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" strokeLinecap="round"/>
                </svg>
              )}
              {event.mode}
            </span>
          )}
          {event.participation_type && (
            <span className="featured-info-badge">
              {event.participation_type === 'Individual' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" strokeLinecap="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {event.participation_type}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="my-event-card-actions">
          <Link 
            to={`/events/${event.id}`}
            className="featured-card-button"
          >
            View Details
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button 
            onClick={() => onDelete(event.id)}
            className="featured-card-button featured-card-button-delete"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyEvents;
