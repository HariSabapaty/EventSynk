import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import ToastNotification from '../components/ToastNotification';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [form, setForm] = useState({ title: '', description: '', poster_url: '', date: '', deadline: '', prizes: '', eligibility: '', category: '' });
  const [fields, setFields] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addField = () => {
    setFields([...fields, { field_name: '', field_type: 'text', is_required: false }]);
  };

  const removeField = (i) => {
    const updated = fields.filter((_, index) => index !== i);
    setFields(updated);
  };

  const handleFieldChange = (i, key, value) => {
    const updated = [...fields];
    updated[i][key] = value;
    setFields(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/events', { ...form, fields });
      setMessage('Event created successfully! 🎉');
      setMessageType('success');
      setTimeout(() => navigate('/my-events'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Creation failed');
      setMessageType('error');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>✨ Create Amazing Event</h2>
        <p>Fill in the details to create your event</p>
      </div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
        <div>
          <label htmlFor="title">Event Title *</label>
          <input 
            id="title"
            name="title" 
            placeholder="Enter event title" 
            value={form.title} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="description">Description *</label>
          <textarea 
            id="description"
            name="description" 
            placeholder="Describe your event in detail..." 
            value={form.description} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="poster_url">Poster URL</label>
          <input 
            id="poster_url"
            name="poster_url" 
            placeholder="https://example.com/poster.jpg" 
            value={form.poster_url} 
            onChange={handleChange} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="date">Event Date & Time *</label>
            <input 
              id="date"
              name="date" 
              type="datetime-local" 
              value={form.date} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div>
            <label htmlFor="deadline">Registration Deadline *</label>
            <input 
              id="deadline"
              name="deadline" 
              type="datetime-local" 
              value={form.deadline} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div>
          <label htmlFor="prizes">Prizes</label>
          <input 
            id="prizes"
            name="prizes" 
            placeholder="e.g., 1st Prize: ₹10,000, 2nd Prize: ₹5,000" 
            value={form.prizes} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <label htmlFor="eligibility">Eligibility</label>
          <input 
            id="eligibility"
            name="eligibility" 
            placeholder="e.g., Open to all students" 
            value={form.eligibility} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <input 
            id="category"
            name="category" 
            placeholder="e.g., Technical, Cultural, Sports" 
            value={form.category} 
            onChange={handleChange} 
          />
        </div>

        <h3 style={{ marginTop: '2rem', color: 'var(--color-primary)' }}>📋 Custom Registration Fields</h3>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', marginBottom: '1rem' }}>
          Add custom fields to collect additional information from participants
        </p>

        {fields.map((field, i) => (
          <div key={i} className="field-group">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <label>Field Name</label>
                <input 
                  placeholder="e.g., Phone Number, College ID" 
                  value={field.field_name} 
                  onChange={e => handleFieldChange(i, 'field_name', e.target.value)} 
                  required 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Field Type</label>
                <select 
                  value={field.field_type} 
                  onChange={e => handleFieldChange(i, 'field_type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <button 
                type="button" 
                className="delete-btn" 
                onClick={() => removeField(i)}
                style={{ marginBottom: '0' }}
              >
                ✕ Remove
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={field.is_required} 
                onChange={e => handleFieldChange(i, 'is_required', e.target.checked)} 
              />
              <span style={{ marginLeft: '0.5rem' }}>Required field</span>
            </label>
          </div>
        ))}

        <button type="button" onClick={addField} style={{ width: '100%', marginBottom: '1rem' }}>
          ➕ Add Custom Field
        </button>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating Event...' : '🚀 Create Event'}
        </button>
      </form>
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default CreateEvent;
