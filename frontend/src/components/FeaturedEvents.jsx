import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const FeaturedEvents = ({ events }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Filter and sort events based on categories
  const categorizedEvents = useMemo(() => {
    const now = new Date();
    
    // Upcoming Events: events where date >= today
    const upcoming = events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
    
    // Trending Events: events with most registrations
    const trending = [...events]
      .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
      .slice(0, 6);
    
    // New Events: recently created events (assuming we have created_at or using id as proxy)
    const newEvents = [...events]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6);
    
    return { upcoming, trending, new: newEvents };
  }, [events]);

  const currentEvents = categorizedEvents[activeTab];

  const tabs = [
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'trending', 
      label: 'Trending', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'new', 
      label: 'New', 
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <section className="featured-events-section">
      <div className="featured-container">
        <div className="featured-header">
          <h2 className="featured-title">
            Discover What's Happening at SSN
          </h2>
          <p className="featured-subtitle">
            Explore the most exciting events on campus
          </p>
        </div>

        {/* Tabs */}
        <div className="featured-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`featured-tab ${activeTab === tab.id ? 'featured-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="featured-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        <div className="featured-grid">
          {currentEvents.length === 0 ? (
            <div className="featured-empty">
              <p>No {activeTab} events available</p>
            </div>
          ) : (
            currentEvents.map((event, index) => (
              <FeaturedEventCard 
                key={event.id} 
                event={event} 
                index={index}
              />
            ))
          )}
        </div>

        {/* View All Link */}
        {currentEvents.length > 0 && (
          <div className="featured-footer">
            <Link to="/events" className="featured-view-all">
              View All Events
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

const FeaturedEventCard = ({ event, index }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
    <div 
      className="featured-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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

export default FeaturedEvents;
