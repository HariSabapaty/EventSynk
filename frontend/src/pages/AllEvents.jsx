import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('event-date-asc');
  const [modeFilter, setModeFilter] = useState('All');
  const [participationFilter, setParticipationFilter] = useState('All');
  const [registrationStatus, setRegistrationStatus] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/events')
      .then(res => {
        setEvents(res.data.events);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  // Get unique categories, modes, and participation types
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];
  const modes = ['All', ...new Set(events.map(e => e.mode).filter(Boolean))];
  const participationTypes = ['All', ...new Set(events.map(e => e.participation_type).filter(Boolean))];

  // Helper function to check if registration is open
  const isRegistrationOpen = (event) => {
    const now = new Date();
    const deadline = new Date(event.deadline);
    const eventDate = new Date(event.date);
    
    // Registration is open if deadline hasn't passed (and event hasn't occurred)
    const isOpen = deadline > now && eventDate > now;
    
    // Debug: uncomment to see what's happening
    // console.log(`Event: ${event.title}, Deadline: ${deadline}, Now: ${now}, IsOpen: ${isOpen}`);
    
    return isOpen;
  };

  // Helper function to get date ranges
  const isInDateRange = (event, range) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    switch(range) {
      case 'All':
        return true;
      case 'Today':
        return eventDate.toDateString() === now.toDateString();
      case 'This Week': {
        const weekFromNow = new Date(now);
        weekFromNow.setDate(now.getDate() + 7);
        return eventDate >= now && eventDate <= weekFromNow;
      }
      case 'This Month': {
        return eventDate.getMonth() === now.getMonth() && 
               eventDate.getFullYear() === now.getFullYear() &&
               eventDate >= now;
      }
      case 'Upcoming':
        return eventDate > now;
      default:
        return true;
    }
  };

  // Filter events based on all criteria
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organiser_name && event.organiser_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    
    const matchesMode = modeFilter === 'All' || event.mode === modeFilter;
    
    const matchesParticipation = participationFilter === 'All' || event.participation_type === participationFilter;
    
    const matchesRegistration = registrationStatus === 'All' || 
                               (registrationStatus === 'Closed' && isRegistrationOpen(event)) ||
                               (registrationStatus === 'Open' && !isRegistrationOpen(event));
    
    const matchesDateRange = isInDateRange(event, dateRange);
    
    return matchesSearch && matchesCategory && matchesMode && matchesParticipation && 
           matchesRegistration && matchesDateRange;
  });

  // Sort filtered events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch(sortBy) {
      case 'event-date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'event-date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'deadline-asc':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'deadline-desc':
        return new Date(b.deadline) - new Date(a.deadline);
      case 'created-desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'created-asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'popularity-desc':
        return (b.registration_count || 0) - (a.registration_count || 0);
      case 'popularity-asc':
        return (a.registration_count || 0) - (b.registration_count || 0);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  // Count active filters
  const activeFiltersCount = [
    categoryFilter !== 'All',
    modeFilter !== 'All',
    participationFilter !== 'All',
    registrationStatus !== 'All',
    dateRange !== 'All',
    searchQuery !== ''
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setModeFilter('All');
    setParticipationFilter('All');
    setRegistrationStatus('All');
    setDateRange('All');
    setSortBy('event-date-asc');
  };

  return (
    <div className="all-events-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>All Events</h1>
          <p>Discover and join exciting events happening at SSN College</p>
        </div>

        {/* Filters Section */}
        <div className="events-filters-container">
          {/* Top Row: Search and Filter Toggle */}
          <div className="filters-top-row">
            {/* Search Bar */}
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search events by title, organizer, or description..."
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

            {/* Sort Dropdown */}
            <div className="sort-dropdown">
              <label htmlFor="sort-select">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h12M3 18h6" strokeLinecap="round"/>
                </svg>
                Sort by:
              </label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="event-date-asc">Event Date: Earliest First</option>
                <option value="event-date-desc">Event Date: Latest First</option>
                <option value="deadline-asc">Deadline: Earliest First</option>
                <option value="deadline-desc">Deadline: Latest First</option>
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="popularity-desc">Most Popular</option>
                <option value="popularity-asc">Least Popular</option>
                <option value="title-asc">Title: A-Z</option>
                <option value="title-desc">Title: Z-A</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <button 
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="filter-badge">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Expandable Filters Section */}
          {showFilters && (
            <div className="filters-expanded">
              <div className="filters-grid">
                {/* Category Filter */}
                {categories.length > 1 && (
                  <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select 
                      value={categoryFilter} 
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="filter-select"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Mode Filter */}
                {modes.length > 1 && (
                  <div className="filter-group">
                    <label className="filter-label">Mode</label>
                    <select 
                      value={modeFilter} 
                      onChange={(e) => setModeFilter(e.target.value)}
                      className="filter-select"
                    >
                      {modes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Participation Type Filter */}
                {participationTypes.length > 1 && (
                  <div className="filter-group">
                    <label className="filter-label">Participation</label>
                    <select 
                      value={participationFilter} 
                      onChange={(e) => setParticipationFilter(e.target.value)}
                      className="filter-select"
                    >
                      {participationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Registration Status Filter */}
                <div className="filter-group">
                  <label className="filter-label">Registration</label>
                  <select 
                    value={registrationStatus} 
                    onChange={(e) => setRegistrationStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="filter-group">
                  <label className="filter-label">Date Range</label>
                  <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Events</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              {/* Clear All Filters Button */}
              {activeFiltersCount > 0 && (
                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={clearAllFilters}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-chips">
              {searchQuery && (
                <div className="filter-chip">
                  <span>🔍 "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')}>×</button>
                </div>
              )}
              {categoryFilter !== 'All' && (
                <div className="filter-chip">
                  <span>📂 {categoryFilter}</span>
                  <button onClick={() => setCategoryFilter('All')}>×</button>
                </div>
              )}
              {modeFilter !== 'All' && (
                <div className="filter-chip">
                  <span>{modeFilter === 'Online' ? '🌐' : '📍'} {modeFilter}</span>
                  <button onClick={() => setModeFilter('All')}>×</button>
                </div>
              )}
              {participationFilter !== 'All' && (
                <div className="filter-chip">
                  <span>{participationFilter === 'Individual' ? '👤' : '👥'} {participationFilter}</span>
                  <button onClick={() => setParticipationFilter('All')}>×</button>
                </div>
              )}
              {registrationStatus !== 'All' && (
                <div className="filter-chip">
                  <span>{registrationStatus === 'Open' ? '🟢' : '🔴'} Registration {registrationStatus}</span>
                  <button onClick={() => setRegistrationStatus('All')}>×</button>
                </div>
              )}
              {dateRange !== 'All' && (
                <div className="filter-chip">
                  <span>📅 {dateRange}</span>
                  <button onClick={() => setDateRange('All')}>×</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Events Count */}
        {!loading && (
          <div className="events-count">
            <span className="count-number">{sortedEvents.length}</span> {sortedEvents.length === 1 ? 'event' : 'events'} found
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>No events found</h3>
            <p>
              {activeFiltersCount > 0
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create an event!'}
            </p>
            {activeFiltersCount > 0 && (
              <button 
                className="btn-primary"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="event-list">
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEvents;
