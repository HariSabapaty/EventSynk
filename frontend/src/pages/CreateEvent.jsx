import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import ToastNotification from '../components/ToastNotification';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [form, setForm] = useState({ title: '', description: '', date: '', deadline: '', prizes: '', eligibility: '', category: '' });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [fields, setFields] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        setMessage('File size must be less than 1MB');
        setMessageType('error');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Only PNG, JPG, JPEG, and GIF files are allowed');
        setMessageType('error');
        return;
      }
      
      setPosterFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('deadline', form.deadline);
      formData.append('prizes', form.prizes || '');
      formData.append('eligibility', form.eligibility || '');
      formData.append('category', form.category);
      formData.append('fields', JSON.stringify(fields));
      
      if (posterFile) {
        formData.append('poster', posterFile);
      }
      
      await axiosInstance.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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
    <div className="create-event-page">
      <div className="create-event-container">
        {/* Left Sidebar */}
        <div className="create-event-sidebar">
          <h1 className="create-event-title">Post an Event</h1>
          
          <div className="create-event-steps">
            <div className="create-step active">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-label">Step 1</div>
                <div className="step-name">Event Details</div>
              </div>
            </div>
            
            <div className="step-divider"></div>
            
            <div className="create-step active">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-label">Step 2</div>
                <div className="step-name">Registration Form</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="create-event-form-wrapper">
          <form onSubmit={handleSubmit} className="create-event-form">
            {/* Event Poster Upload */}
            <div className="form-group">
              <label htmlFor="poster" className="form-label">
                Event Poster
              </label>
              <div className="file-upload-wrapper">
                <input 
                  id="poster"
                  name="poster" 
                  type="file"
                  className="file-input"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  onChange={handleFileChange}
                />
                <label htmlFor="poster" className="file-upload-label">
                  {posterFile ? (
                    <div className="file-upload-preview">
                      <img src={posterPreview} alt="Poster preview" />
                      <div className="file-upload-info">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{posterFile.name}</span>
                        <span className="file-size">({(posterFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="file-upload-placeholder">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="upload-text">Click to upload or drag and drop</p>
                      <p className="upload-hint">PNG, JPG, JPEG or GIF (max 1MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Event Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Event Title <span className="required">*</span>
              </label>
              <input 
                id="title"
                name="title" 
                className="form-input"
                placeholder="Enter Event Title." 
                value={form.title} 
                onChange={handleChange} 
                maxLength={190}
                required 
              />
              <p className="form-hint">Max 190 characters</p>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Event Category <span className="required">*</span>
              </label>
              <select 
                id="category"
                name="category" 
                className="form-select"
                value={form.category} 
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop & Webinar</option>
                <option value="Competition">Competition</option>
                <option value="Seminar">Seminar</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea 
                id="description"
                name="description" 
                className="form-textarea"
                placeholder="Describe your event in detail..." 
                value={form.description} 
                onChange={handleChange} 
                rows={6}
                required 
              />
            </div>

            {/* Date and Deadline */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Event Date & Time <span className="required">*</span>
                </label>
                <input 
                  id="date"
                  name="date" 
                  type="datetime-local" 
                  className="form-input"
                  value={form.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline" className="form-label">
                  Registration Deadline <span className="required">*</span>
                </label>
                <input 
                  id="deadline"
                  name="deadline" 
                  type="datetime-local" 
                  className="form-input"
                  value={form.deadline} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Prizes */}
            <div className="form-group">
              <label htmlFor="prizes" className="form-label">
                Prizes
              </label>
              <input 
                id="prizes"
                name="prizes" 
                className="form-input"
                placeholder="e.g., 1st Prize: ₹10,000, 2nd Prize: ₹5,000" 
                value={form.prizes} 
                onChange={handleChange} 
              />
            </div>

            {/* Eligibility */}
            <div className="form-group">
              <label htmlFor="eligibility" className="form-label">
                Eligibility
              </label>
              <input 
                id="eligibility"
                name="eligibility" 
                className="form-input"
                placeholder="e.g., Open to all students" 
                value={form.eligibility} 
                onChange={handleChange} 
              />
            </div>

            {/* Custom Registration Fields Section */}
            <div className="form-section-divider"></div>
            <h3 className="form-section-title">Custom Registration Fields</h3>
            <p className="form-section-subtitle">
              Add custom fields to collect additional information from participants
            </p>

            {fields.map((field, i) => (
              <div key={i} className="custom-field-group">
                <div className="custom-field-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Field Name</label>
                    <input 
                      className="form-input"
                      placeholder="e.g., Phone Number, College ID" 
                      value={field.field_name} 
                      onChange={e => handleFieldChange(i, 'field_name', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Field Type</label>
                    <select 
                      className="form-select"
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
                    className="remove-field-btn" 
                    onClick={() => removeField(i)}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    className="form-checkbox"
                    checked={field.is_required} 
                    onChange={e => handleFieldChange(i, 'is_required', e.target.checked)} 
                  />
                  <span>Required field</span>
                </label>
              </div>
            ))}

            <button type="button" onClick={addField} className="add-field-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Field
            </button>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default CreateEvent;
