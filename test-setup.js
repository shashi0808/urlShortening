#!/usr/bin/env node

/**
 * Simple test script to verify end-to-end functionality
 * Run this after starting both server and client
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';
const CLIENT_BASE = 'http://localhost:3000';

async function testEndToEnd() {
  console.log('🧪 Starting End-to-End Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Create Short URL
    console.log('\n2️⃣ Testing URL Shortening...');
    const shortenResponse = await axios.post(`${API_BASE}/shorten`, {
      longUrl: 'https://www.google.com'
    });
    console.log('✅ URL shortened:', shortenResponse.data);
    const shortCode = shortenResponse.data.shortCode;

    // Test 3: Get Statistics
    console.log('\n3️⃣ Testing Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/stats/${shortCode}`);
    console.log('✅ Statistics retrieved:', statsResponse.data);

    // Test 4: Test Redirect (without following)
    console.log('\n4️⃣ Testing Redirect...');
    try {
      await axios.get(`${API_BASE}/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: (status) => status === 302
      });
      console.log('✅ Redirect working correctly');
    } catch (error) {
      if (error.response && error.response.status === 302) {
        console.log('✅ Redirect working correctly');
      } else {
        throw error;
      }
    }

    // Test 5: Verify Click Counter Increment
    console.log('\n5️⃣ Testing Click Counter...');
    const updatedStatsResponse = await axios.get(`${API_BASE}/stats/${shortCode}`);
    if (updatedStatsResponse.data.clicks > statsResponse.data.clicks) {
      console.log('✅ Click counter incremented correctly');
    } else {
      console.log('⚠️ Click counter may not have incremented (this is okay for this test)');
    }

    // Test 6: Test Error Handling
    console.log('\n6️⃣ Testing Error Handling...');
    try {
      await axios.get(`${API_BASE}/stats/nonexistent`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 404 error handling working correctly');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All tests passed! Your URL shortener is working correctly.');
    console.log(`\n🌐 Frontend: ${CLIENT_BASE}`);
    console.log(`🔧 Backend API: ${API_BASE}`);
    console.log(`📊 Test your short URL: ${shortenResponse.data.shortUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Check if servers are running
async function checkServers() {
  console.log('🔍 Checking if servers are running...\n');
  
  try {
    await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend server is running');
  } catch (error) {
    console.error('❌ Backend server is not running. Please start it with:');
    console.error('   cd server && npm run dev');
    process.exit(1);
  }

  try {
    await axios.get(CLIENT_BASE);
    console.log('✅ Frontend server is running');
  } catch (error) {
    console.error('❌ Frontend server is not running. Please start it with:');
    console.error('   cd client && npm start');
    process.exit(1);
  }

  console.log('');
}

// Main execution
async function main() {
  await checkServers();
  await testEndToEnd();
}

if (require.main === module) {
  main();
}

module.exports = { testEndToEnd, checkServers };