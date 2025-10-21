import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import ToastNotification from '../components/ToastNotification';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [fields, setFields] = useState([]);
  const [responses, setResponses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axiosInstance.get(`/events/${id}`)
      .then(res => {
        setEvent(res.data.event);
        setFields(res.data.event.fields);
      });
  }, [id]);

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/events/${id}/register`, { responses });
      setMessage('Registered successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div>
      <h2>{event.title}</h2>
      <img src={event.poster_url} alt={event.title} width={300} />
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleString()}</p>
      <p>Deadline: {new Date(event.deadline).toLocaleString()}</p>
      <p>Prizes: {event.prizes}</p>
      <p>Eligibility: {event.eligibility}</p>
      <p>Organiser: {event.organiser}</p>
      <p>Registrations: {event.registration_count}</p>
      {user && (
        <form onSubmit={handleRegister}>
          <h3>Register</h3>
          {fields.map(field => (
            <div key={field.id}>
              <label>{field.field_name}</label>
              <input
                type={field.field_type}
                required={field.is_required}
                onChange={e => {
                  const value = e.target.value;
                  setResponses(prev => {
                    const filtered = prev.filter(r => r.field_id !== field.id);
                    return [...filtered, { field_id: field.id, response_value: value }];
                  });
                }}
              />
            </div>
          ))}
          <button type="submit">Register</button>
        </form>
      )}
      <ToastNotification message={message} type="info" onClose={() => setMessage('')} />
    </div>
  );
};

export default EventDetails;
