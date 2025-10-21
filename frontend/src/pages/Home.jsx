import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axiosInstance.get('/events')
      .then(res => setEvents(res.data.events))
      .catch(() => setEvents([]));
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <div className="event-list">
        {events.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
};

export default Home;
