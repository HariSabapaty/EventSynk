import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
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
    try {
      await register(name, email, password);
      setToast('Registration successful!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setToast(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Name</label>
        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        {errors.name && <span className="error">{errors.name}</span>}

        <label htmlFor="email">College Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        {errors.password && <span className="error">{errors.password}</span>}

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

        <button type="submit">Register</button>
      </form>
      <ToastNotification message={toast} type={toast === 'Registration successful!' ? 'success' : 'error'} onClose={() => setToast('')} />
    </div>
  );
};

export default Register;
