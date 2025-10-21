import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const MyEvents = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      axiosInstance.get(`/events/users/${user.id}/events`)
        .then(res => setEvents(res.data.events))
        .catch(() => setEvents([]));
    }
  }, [user]);

  const handleDelete = async id => {
    try {
      await axiosInstance.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      setMessage('Event deleted');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h2>My Events</h2>
      {events.map(event => (
        <div key={event.id}>
          <Link to={`/events/${event.id}`}>{event.title}</Link>
          <button onClick={() => handleDelete(event.id)}>Delete</button>
        </div>
      ))}
      <ToastNotification message={message} type="info" onClose={() => setMessage('')} />
    </div>
  );
};

export default MyEvents;
