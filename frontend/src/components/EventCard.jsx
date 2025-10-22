import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => (
  <div className="event-card">
    <img 
      src={event.poster_url || 'https://via.placeholder.com/400x200/0A21C0/FFFFFF?text=Event+Poster'} 
      alt={event.title}
      onError={(e) => {
        e.target.src = 'https://via.placeholder.com/400x200/0A21C0/FFFFFF?text=Event+Poster';
      }}
    />
    <div className="event-card-content">
      <h3>{event.title}</h3>
      <p>
        📅 {new Date(event.date).toLocaleDateString('en-US', { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
      <p>👤 {event.organiser_name}</p>
      <p>✅ {event.registration_count} {event.registration_count === 1 ? 'Registration' : 'Registrations'}</p>
      <Link to={`/events/${event.id}`}>View Details →</Link>
    </div>
  </div>
);

export default EventCard;
