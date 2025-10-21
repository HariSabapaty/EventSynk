import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';

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
    <div>
      <div className="page-header">
        <h1>🎉 Discover Amazing Events</h1>
        <p>Join exciting events happening at your college</p>
      </div>
      {loading ? (
        <div className="loading">Loading events</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
          <h3>No events found</h3>
          <p>Be the first to create an event!</p>
        </div>
      ) : (
        <div className="event-list">
          {events.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
};

export default Home;
