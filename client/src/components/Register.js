import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Store session ID in localStorage
      localStorage.setItem('sessionId', response.data.sessionId);
      
      // Set axios default header
      axios.defaults.headers.common['X-Session-Id'] = response.data.sessionId;
      
      // Call parent callback
      onLogin(response.data.user);

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name (optional):</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Already have an account? <Link to="/login" className="stats-link">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;