import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

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

  // Get unique categories
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organiser_name && event.organiser_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="all-events-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>All Events</h1>
          <p>Discover and join exciting events happening at SSN College</p>
        </div>

        {/* Filters Section */}
        <div className="events-filters">
          {/* Search Bar */}
          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search events..."
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

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-filter-btn ${categoryFilter === category ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events Count */}
        {!loading && (
          <div className="events-count">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            {searchQuery && ` for "${searchQuery}"`}
            {categoryFilter !== 'All' && ` in ${categoryFilter}`}
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
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
            <p>
              {searchQuery || categoryFilter !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create an event!'}
            </p>
            {(searchQuery || categoryFilter !== 'All') && (
              <button 
                className="btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="event-list">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEvents;
