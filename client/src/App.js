import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Stats from './components/Stats';
import Login from './components/Login';
import Register from './components/Register';
import MyUrls from './components/MyUrls';
import HealthCheck from './components/HealthCheck';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      axios.defaults.headers.common['X-Session-Id'] = sessionId;
      
      // Verify session with backend
      axios.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          // Session is invalid, remove it
          localStorage.removeItem('sessionId');
          delete axios.defaults.headers.common['X-Session-Id'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sessionId');
      delete axios.defaults.headers.common['X-Session-Id'];
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="container">
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>URL Shortener</h1>
              <p>Shorten your long URLs and track their performance</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {user ? (
                <>
                  <span style={{ color: '#666' }}>Welcome, {user.name || user.email}!</span>
                  <Link to="/my-urls" className="stats-link">My URLs</Link>
                  <button 
                    onClick={handleLogout}
                    className="btn"
                    style={{ 
                      fontSize: '14px', 
                      padding: '8px 16px',
                      backgroundColor: '#6c757d'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="stats-link">Login</Link>
                  <Link to="/register" className="btn" style={{ 
                    fontSize: '14px', 
                    padding: '8px 16px',
                    textDecoration: 'none'
                  }}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        <HealthCheck />
        
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/stats/:code" element={<Stats />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/my-urls" element={user ? <MyUrls /> : <Login onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;