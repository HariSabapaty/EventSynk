import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => (
  <div className="event-card">
    <img src={event.poster_url} alt={event.title} width={200} />
    <h3>{event.title}</h3>
    <p>Date: {new Date(event.date).toLocaleString()}</p>
    <p>Organiser: {event.organiser_name}</p>
    <p>Registrations: {event.registration_count}</p>
    <Link to={`/events/${event.id}`}>View Details</Link>
  </div>
);

export default EventCard;
