import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import ToastNotification from '../components/ToastNotification';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [form, setForm] = useState({ title: '', description: '', poster_url: '', date: '', deadline: '', prizes: '', eligibility: '', category: '' });
  const [fields, setFields] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addField = () => {
    setFields([...fields, { field_name: '', field_type: 'text', is_required: false }]);
  };

  const handleFieldChange = (i, key, value) => {
    const updated = [...fields];
    updated[i][key] = value;
    setFields(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.post('/events', { ...form, fields });
      setMessage('Event created!');
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="poster_url" placeholder="Poster URL" value={form.poster_url} onChange={handleChange} />
        <input name="date" type="datetime-local" value={form.date} onChange={handleChange} required />
        <input name="deadline" type="datetime-local" value={form.deadline} onChange={handleChange} required />
        <input name="prizes" placeholder="Prizes" value={form.prizes} onChange={handleChange} />
        <input name="eligibility" placeholder="Eligibility" value={form.eligibility} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <h3>Registration Fields</h3>
        {fields.map((field, i) => (
          <div key={i}>
            <input placeholder="Field Name" value={field.field_name} onChange={e => handleFieldChange(i, 'field_name', e.target.value)} required />
            <select value={field.field_type} onChange={e => handleFieldChange(i, 'field_type', e.target.value)}>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
            </select>
            <label>
              Required
              <input type="checkbox" checked={field.is_required} onChange={e => handleFieldChange(i, 'is_required', e.target.checked)} />
            </label>
          </div>
        ))}
        <button type="button" onClick={addField}>Add Field</button>
        <button type="submit">Create Event</button>
      </form>
      <ToastNotification message={message} type="info" onClose={() => setMessage('')} />
    </div>
  );
};

export default CreateEvent;
