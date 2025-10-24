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
    { id: 'upcoming', label: 'Upcoming', icon: '📅' },
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'new', label: 'New', icon: '✨' }
  ];

  return (
    <section className="featured-events-section">
      <div className="featured-container">
        <div className="featured-header">
          <h2 className="featured-title">
            <span className="featured-emoji">🔥</span>
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

export default FeaturedEvents;
