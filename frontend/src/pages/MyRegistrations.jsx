import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyRegistrations = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    if (user) {
      axiosInstance.get(`/events/users/${user.id}/registrations`)
        .then(res => setRegistrations(res.data.registrations))
        .catch(() => setRegistrations([]));
    }
  }, [user]);

  return (
    <div>
      <h2>My Registrations</h2>
      {registrations.map(reg => (
        <div key={reg.event_id}>
          <Link to={`/events/${reg.event_id}`}>{reg.event_title}</Link>
        </div>
      ))}
    </div>
  );
};

export default MyRegistrations;
