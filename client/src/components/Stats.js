import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Stats = () => {
  const { code } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/stats/${code}`);
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchStats();
    }
  }, [code]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return (
      <div>
        <Link to="/" className="btn back-btn">← Back to Home</Link>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="btn back-btn">← Back to Home</Link>
      
      <div className="stats-container">
        <h2>URL Statistics</h2>
        
        <div className="stats-item">
          <span className="stats-label">Short Code:</span>
          <span className="stats-value">{stats.shortCode}</span>
        </div>
        
        <div className="stats-item">
          <span className="stats-label">Original URL:</span>
          <span className="stats-value">
            <a href={stats.longUrl} target="_blank" rel="noopener noreferrer">
              {stats.longUrl}
            </a>
          </span>
        </div>
        
        <div className="stats-item">
          <span className="stats-label">Total Clicks:</span>
          <span className="stats-value">{stats.clicks}</span>
        </div>
        
        <div className="stats-item">
          <span className="stats-label">Created:</span>
          <span className="stats-value">{formatDate(stats.createdAt)}</span>
        </div>
        
        <div className="stats-item">
          <span className="stats-label">Last Updated:</span>
          <span className="stats-value">{formatDate(stats.updatedAt)}</span>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a
            href={`/${stats.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Test Short URL →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Stats;