import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/health');
        if (response.data.status === 'OK') {
          setStatus('connected');
        } else {
          setStatus('error');
          setError('Backend returned unexpected status');
        }
      } catch (err) {
        setStatus('error');
        setError('Cannot connect to backend server');
      }
    };

    checkHealth();
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        🔍 Checking backend connection...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb',
        borderRadius: '5px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        ❌ Backend connection failed: {error}
        <br />
        <small>Make sure the server is running on port 3001</small>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: '#d4edda', 
      border: '1px solid #c3e6cb',
      borderRadius: '5px',
      marginBottom: '20px',
      fontSize: '14px'
    }}>
      ✅ Backend connected successfully
    </div>
  );
};

export default HealthCheck;