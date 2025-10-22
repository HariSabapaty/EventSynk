import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';
import HeroSection from '../components/HeroSection';
import FeaturedEvents from '../components/FeaturedEvents';
import PlatformFeatures from '../components/PlatformFeatures';
import CallToAction from '../components/CallToAction';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="home-page">
      <HeroSection />
      
      {/* Platform Features Section */}
      <PlatformFeatures />
      
      {/* Featured Events Section */}
      {!loading && events.length > 0 && (
        <FeaturedEvents events={events} />
      )}
      
      <div id="events-section" className="events-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All Events</h2>
            <p className="section-subtitle">Browse through all events happening at SSN College</p>
          </div>
          
          {loading ? (
            <div className="loading">Loading events</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No events found</h3>
              <p>Be the first to create an event!</p>
            </div>
          ) : (
            <div className="event-list">
              {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      <CallToAction />
    </div>
  );
};

export default Home;
