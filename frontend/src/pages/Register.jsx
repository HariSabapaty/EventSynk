import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!email.endsWith('@ssn.edu.in')) errs.email = 'Email must be a college email (@ssn.edu.in).';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register(name, email, password);
      setToast('Registration successful!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>✨ Join EventSynk</h2>
        <p>Create an account to manage amazing events</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name">Full Name</label>
          <input 
            id="name" 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter your full name"
            className={errors.name ? 'error-input' : ''}
            required 
          />
          {errors.name && <span className="error">⚠️ {errors.name}</span>}
        </div>

        <div>
          <label htmlFor="email">College Email</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="yourname@ssn.edu.in"
            className={errors.email ? 'error-input' : ''}
            required 
          />
          {errors.email && <span className="error">⚠️ {errors.email}</span>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="At least 8 characters"
            className={errors.password ? 'error-input' : ''}
            required 
          />
          {errors.password && <span className="error">⚠️ {errors.password}</span>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            id="confirmPassword" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder="Re-enter your password"
            className={errors.confirmPassword ? 'error-input' : ''}
            required 
          />
          {errors.confirmPassword && <span className="error">⚠️ {errors.confirmPassword}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Login here</Link>
        </p>
      </form>
      <ToastNotification message={toast} type={toast === 'Registration successful!' ? 'success' : 'error'} onClose={() => setToast('')} />
    </div>
  );
};

export default Register;
