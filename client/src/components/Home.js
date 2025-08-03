import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = ({ user }) => {
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/shorten', { longUrl });
      setResult(response.data);
      setLongUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div>
      {!user && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          border: '1px solid #b3d9ff',
          borderRadius: '5px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            💡 <strong>Tip:</strong> <Link to="/register" className="stats-link">Register</Link> or <Link to="/login" className="stats-link">login</Link> to track your URLs and view detailed analytics!
          </p>
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="longUrl">Enter your long URL:</label>
            <input
              type="url"
              id="longUrl"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <div className="result-container">
          <h3>✅ URL Shortened Successfully!</h3>
          
          <div className="url-result">
            <input
              type="text"
              value={result.shortUrl}
              readOnly
            />
            <button
              className="copy-btn"
              onClick={() => copyToClipboard(result.shortUrl)}
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <a
              href={`/stats/${result.shortCode}`}
              className="stats-link"
            >
              View Statistics →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;