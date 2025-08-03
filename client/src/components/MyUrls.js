import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyUrls = () => {
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUrls = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/my-urls?page=${page}&limit=10`);
      setUrls(response.data.urls);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading your URLs...</div>;
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
        <h2>My URLs ({pagination.totalCount} total)</h2>
        
        {urls.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            You haven't created any URLs yet. <Link to="/" className="stats-link">Create one now</Link>
          </p>
        ) : (
          <>
            {urls.map((url) => (
              <div key={url.id} style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '15px',
                backgroundColor: '#fafafa'
              }}>
                <div className="stats-item">
                  <span className="stats-label">Short URL:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="stats-value">{url.shortUrl}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(url.shortUrl)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Original URL:</span>
                  <span className="stats-value" style={{ 
                    wordBreak: 'break-all',
                    maxWidth: '400px'
                  }}>
                    <a href={url.longUrl} target="_blank" rel="noopener noreferrer">
                      {url.longUrl.length > 50 ? url.longUrl.substring(0, 50) + '...' : url.longUrl}
                    </a>
                  </span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Clicks:</span>
                  <span className="stats-value">{url.clicks}</span>
                </div>
                
                <div className="stats-item">
                  <span className="stats-label">Created:</span>
                  <span className="stats-value">{formatDate(url.createdAt)}</span>
                </div>

                {url.recentClicks.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <small style={{ color: '#666' }}>Recent clicks from: </small>
                    {url.recentClicks.slice(0, 3).map((click, index) => (
                      <small key={index} style={{ color: '#666' }}>
                        {click.country || 'Unknown'}{index < 2 && index < url.recentClicks.length - 1 ? ', ' : ''}
                      </small>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                  <Link 
                    to={`/stats/${url.shortCode}`} 
                    className="stats-link"
                  >
                    View Statistics →
                  </Link>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '10px',
                marginTop: '20px'
              }}>
                <button
                  className="btn"
                  onClick={() => fetchUrls(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  style={{ 
                    backgroundColor: pagination.hasPrev ? '#6c757d' : '#ccc',
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  Previous
                </button>
                
                <span style={{ color: '#666' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  className="btn"
                  onClick={() => fetchUrls(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  style={{ 
                    backgroundColor: pagination.hasNext ? '#6c757d' : '#ccc',
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyUrls;