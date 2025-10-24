import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ToastNotification from '../components/ToastNotification';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    deadline: '', 
    prizes: '', 
    eligibility: '', 
    category: '',
    mode: '',
    venue: '',
    participation_type: '',
    team_size: ''
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [defaultFields, setDefaultFields] = useState([
    { id: 'phone', field_name: 'Mobile Number', field_type: 'text', is_required: true, is_default: true, enabled: true },
    { id: 'department', field_name: 'Department', field_type: 'text', is_required: true, is_default: true, enabled: true },
    { id: 'year', field_name: 'Year of Study', field_type: 'text', is_required: true, is_default: true, enabled: true },
    { id: 'rollno', field_name: 'Roll Number', field_type: 'text', is_required: true, is_default: true, enabled: true }
  ]);
  const [fields, setFields] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.field-dropdown')) {
        document.querySelectorAll('.field-dropdown-menu').forEach(menu => {
          menu.style.display = 'none';
        });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleDefaultFieldToggle = (fieldId, setting) => {
    const updated = defaultFields.map(field => {
      if (field.id === fieldId) {
        if (setting === 'enabled') {
          return { ...field, enabled: !field.enabled };
        } else if (setting === 'required') {
          return { ...field, is_required: !field.is_required };
        }
      }
      return field;
    });
    setDefaultFields(updated);
  };

  const validateStep1 = () => {
    // Validate required fields for step 1
    if (!form.title || !form.description || !form.category || !form.date || !form.deadline || !form.mode || !form.participation_type) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return false;
    }

    // Client-side date validation
    const eventDate = new Date(form.date);
    const deadlineDate = new Date(form.deadline);
    const now = new Date();
    
    if (eventDate <= now) {
      setMessage('Event date must be in the future');
      setMessageType('error');
      return false;
    }
    
    if (deadlineDate <= now) {
      setMessage('Registration deadline must be in the future');
      setMessageType('error');
      return false;
    }
    
    if (deadlineDate >= eventDate) {
      setMessage('Registration deadline must be before the event date');
      setMessageType('error');
      return false;
    }

    // Validate mode and venue
    if (form.mode === 'Offline' && !form.venue) {
      setMessage('Venue is required for offline events');
      setMessageType('error');
      return false;
    }

    // Validate team size
    if (form.participation_type === 'Team' && (!form.team_size || form.team_size < 2)) {
      setMessage('Team size must be at least 2');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    // Re-validate step 1 data
    if (!validateStep1()) {
      setLoading(false);
      return;
    }
    
    try {
      // Combine enabled default fields and custom fields
      // Note: Name and Email are NOT included as they are auto-fetched from user account
      const enabledDefaultFields = defaultFields
        .filter(field => field.enabled)
        .map(field => ({
          field_name: field.field_name,
          field_type: field.field_type,
          is_required: field.is_required
        }));
      
      const allFields = [...enabledDefaultFields, ...fields];
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('date', form.date);
      formData.append('deadline', form.deadline);
      formData.append('prizes', form.prizes || '');
      formData.append('eligibility', form.eligibility || '');
      formData.append('category', form.category);
      formData.append('mode', form.mode || '');
      formData.append('venue', form.venue || '');
      formData.append('participation_type', form.participation_type || '');
      formData.append('team_size', form.team_size || '');
      formData.append('fields', JSON.stringify(allFields));
      
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
            <div className={`create-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-label">Step 1</div>
                <div className="step-name">Event Details</div>
              </div>
            </div>
            
            <div className="step-divider"></div>
            
            <div className={`create-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-label">Step 2</div>
                <div className="step-name">Registration Form</div>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="step-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentStep / 2) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">Step {currentStep} of 2</p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="create-event-form-wrapper">
          <form onSubmit={handleSubmit} className="create-event-form">
            
            {/* STEP 1: Event Details */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <h2>Event Details</h2>
                  <p>Provide basic information about your event</p>
                </div>
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
                <option value="Hackathon">Hackathon</option>
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
                placeholder="Provide a detailed description of your event:&#10;&#10;• What is the event about?&#10;• Key topics or activities covered&#10;• What participants will learn or gain&#10;• Event schedule or agenda&#10;• Special guests or speakers&#10;• Any prerequisites or requirements&#10;&#10;Example: Join us for an exciting 24-hour hackathon where you'll collaborate with peers to build innovative solutions. This event features workshops on cutting-edge technologies, mentorship from industry experts, and opportunities to network with fellow developers." 
                value={form.description} 
                onChange={handleChange} 
                rows={8}
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
                <p className="form-hint">Must be in the future</p>
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
                <p className="form-hint">Must be before event date</p>
              </div>
            </div>

            {/* Mode and Venue */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mode" className="form-label">
                  Event Mode <span className="required">*</span>
                </label>
                <select 
                  id="mode"
                  name="mode" 
                  className="form-select"
                  value={form.mode} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              {form.mode === 'Offline' && (
                <div className="form-group">
                  <label htmlFor="venue" className="form-label">
                    Venue <span className="required">*</span>
                  </label>
                  <input 
                    id="venue"
                    name="venue" 
                    className="form-input"
                    placeholder="e.g., Main Auditorium, Block A - Room 301" 
                    value={form.venue} 
                    onChange={handleChange} 
                    required={form.mode === 'Offline'}
                  />
                </div>
              )}
            </div>

            {/* Participation Type and Team Size */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="participation_type" className="form-label">
                  Participation Type <span className="required">*</span>
                </label>
                <select 
                  id="participation_type"
                  name="participation_type" 
                  className="form-select"
                  value={form.participation_type} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                </select>
              </div>
              {form.participation_type === 'Team' && (
                <div className="form-group">
                  <label htmlFor="team_size" className="form-label">
                    Maximum Team Size <span className="required">*</span>
                  </label>
                  <input 
                    id="team_size"
                    name="team_size" 
                    type="number"
                    min="2"
                    max="20"
                    className="form-input"
                    placeholder="e.g., 4" 
                    value={form.team_size} 
                    onChange={handleChange} 
                    required={form.participation_type === 'Team'}
                  />
                  <p className="form-hint">Minimum 2 members</p>
                </div>
              )}
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
                Eligibility Criteria
              </label>
              <textarea 
                id="eligibility"
                name="eligibility" 
                className="form-textarea"
                placeholder="Specify who can participate in this event:&#10;&#10;Examples:&#10;• Open to all SSN College students&#10;• Only for 2nd and 3rd year CSE students&#10;• Open to all engineering students across India&#10;• Participants must have basic knowledge of Python&#10;• Final year students with CGPA above 7.5&#10;• Open to faculty and students" 
                value={form.eligibility} 
                onChange={handleChange} 
                rows={4}
              />
            </div>

            {/* Step 1 Navigation */}
            <div className="form-actions">
              <button type="button" onClick={handleNext} className="btn-primary btn-next">
                Next: Registration Form
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
            )}

            {/* STEP 2: Registration Form */}
            {currentStep === 2 && (
          <div className="form-step">
                <div className="step-header">
                  <h2>Registration Form</h2>
                  <p>Configure fields to collect participant information</p>
                </div>

            {/* Auto-filled Fields Notice */}
            <div className="auto-fields-notice">
              <div className="notice-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <div className="notice-content">
                <strong>Name and Email</strong> will be automatically fetched from the participant's account and are always required.
              </div>
            </div>

            {/* Basic Details Section */}
            <div className="default-fields-section">
              <h3 className="form-section-title">Basic Details (Filled by all participants)</h3>
              <p className="form-section-subtitle">
                These are standard fields for college events. You can mark them as optional or turn them off if not needed.
              </p>

              <div className="default-fields-list">
                {defaultFields.map((field) => (
                  <div key={field.id} className={`default-field-item ${!field.enabled ? 'disabled' : ''}`}>
                    <div className="default-field-header">
                      <div className="default-field-info">
                        <div className="default-field-icon">
                          {field.id === 'phone' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round"/>
                            </svg>
                          )}
                          {field.id === 'department' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                          {field.id === 'year' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
                              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
                            </svg>
                          )}
                          {field.id === 'rollno' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="default-field-label">
                          <span className="field-name">{field.field_name}</span>
                          <span className="field-type">{field.field_type}</span>
                        </div>
                      </div>

                      <div className="default-field-controls">
                        <div className="field-status-badge">
                          {field.enabled ? (
                            field.is_required ? (
                              <span className="status-required">Required</span>
                            ) : (
                              <span className="status-optional">Optional</span>
                            )
                          ) : (
                            <span className="status-off">Off</span>
                          )}
                        </div>
                        
                        <div className="field-dropdown">
                          <button 
                            type="button" 
                            className="field-settings-btn"
                            onClick={() => {
                              const dropdown = document.getElementById(`dropdown-${field.id}`);
                              dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <div id={`dropdown-${field.id}`} className="field-dropdown-menu">
                            {field.enabled && (
                              <button
                                type="button"
                                onClick={() => handleDefaultFieldToggle(field.id, 'required')}
                                className="dropdown-item"
                              >
                                {field.is_required ? 'Make Optional' : 'Make Required'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDefaultFieldToggle(field.id, 'enabled')}
                              className="dropdown-item"
                            >
                              {field.enabled ? 'Turn Off' : 'Turn On'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="form-section-divider"></div>
            <h3 className="form-section-title">Additional Custom Fields</h3>
            <p className="form-section-subtitle">
              Add more fields to collect specific information for your event
            </p>

            {fields.length === 0 && (
              <div className="empty-fields-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No additional custom fields</p>
                <span>Click "Add Custom Field" below to add more fields if needed</span>
              </div>
            )}

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

            {/* Step 2 Navigation */}
            <div className="form-actions">
              <button type="button" onClick={handleBack} className="btn-secondary">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    Create Event
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
            )}
            
          </form>
        </div>
      </div>
      <ToastNotification message={message} type={messageType} onClose={() => setMessage('')} />
    </div>
  );
};

export default CreateEvent;
