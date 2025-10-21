import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>🔐 Welcome Back</h2>
        <p>Login to manage your events</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">College Email</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="yourname@ssn.edu.in"
            required 
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter your password"
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-light)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register here</Link>
        </p>
      </form>
      <ToastNotification message={error} type="error" onClose={() => setError('')} />
    </div>
  );
};

export default Login;
