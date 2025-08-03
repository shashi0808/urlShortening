# URL Shortener - Backend Server

A Node.js Express API server that handles URL shortening, redirects, and statistics.

## 🎯 What This Server Does

- **Shortens URLs** - Takes long URLs and creates short codes
- **User Authentication** - Simple session-based login system
- **Handles Redirects** - When someone clicks a short URL, redirects to the original
- **Advanced Analytics** - Tracks IP addresses, locations, timestamps, referrers
- **Paginated History** - Returns user's URLs with pagination
- **Provides Statistics** - Shows creation dates, click counts, and detailed analytics
- **Rate Limiting** - Prevents abuse with request limits
- **Stores Data** - Uses PostgreSQL database with 4 tables

## 📋 Prerequisites (What You Need)

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Check if installed: `node --version`

2. **PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/
   - Check if installed: `psql --version`

3. **npm** (comes with Node.js)
   - Check if installed: `npm --version`

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies
```bash
# Navigate to server folder
cd server

# Install all required packages
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

**Edit the `.env` file** with your database details:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/urlshortener"
PORT=3001
BASE_URL="http://localhost:3001"
NODE_ENV="development"
```

**Replace these values:**
- `username` - Your PostgreSQL username (usually `postgres`)
- `password` - Your PostgreSQL password
- `localhost:5432` - Your database host and port
- `urlshortener` - Database name (you'll create this next)

### Step 3: Create Database
```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE urlshortener;"

# If you get permission errors, try:
sudo -u postgres psql -c "CREATE DATABASE urlshortener;"
```

### Step 4: Set Up Database Tables
```bash
# Create the database structure
npm run db:migrate

# Generate Prisma client (connects to database)
npm run db:generate
```

### Step 5: Start the Server
```bash
# Start in development mode (auto-restarts when you change code)
npm run dev

# You should see: "Server running on port 3001"
```

## ✅ Test If It's Working

### 1. Health Check
Open your browser or use curl:
```bash
curl http://localhost:3001/health
```
You should see: `{"status":"OK","timestamp":"..."}`

### 2. Create a Short URL
```bash
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://www.google.com"}'
```

You should get back something like:
```json
{
  "shortUrl": "http://localhost:3001/abc123",
  "shortCode": "abc123",
  "longUrl": "https://www.google.com"
}
```

### 3. Test the Redirect
```bash
# This will redirect you to Google
curl -L http://localhost:3001/abc123
```

### 4. Check Statistics
```bash
# Replace 'abc123' with your actual short code
curl http://localhost:3001/stats/abc123
```

## 📊 API Endpoints

### Authentication Endpoints

#### POST /auth/register
**Purpose:** Create a new user account

**Request:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "mypassword"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "sessionId": "Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"
}
```

#### POST /auth/login
**Purpose:** Login with email and password

**Request:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mypassword"
  }'
```

#### POST /auth/logout
**Purpose:** Logout and invalidate session

**Request:**
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "X-Session-Id: Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"
```

#### GET /auth/me
**Purpose:** Get current user information

**Request:**
```bash
curl http://localhost:3001/auth/me \
  -H "X-Session-Id: Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"
```

### URL Management Endpoints

#### POST /shorten
**Purpose:** Create a short URL from a long URL

**Request (Anonymous):**
```bash
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com/very/long/url"}'
```

**Request (Logged in):**
```bash
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF" \
  -d '{"longUrl": "https://example.com/very/long/url"}'
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3001/Kx9mP2",
  "shortCode": "Kx9mP2",
  "longUrl": "https://example.com/very/long/url"
}
```

#### GET /:code
**Purpose:** Redirect to the original URL and track analytics

**Example:**
```bash
# This redirects and records IP, location, timestamp
curl -L http://localhost:3001/Kx9mP2
```

#### GET /stats/:code
**Purpose:** Get statistics for a short URL

**Example:**
```bash
curl http://localhost:3001/stats/Kx9mP2
```

**Response:**
```json
{
  "shortCode": "Kx9mP2",
  "longUrl": "https://example.com/very/long/url",
  "clicks": 5,
  "createdAt": "2024-01-01T10:30:00.000Z",
  "updatedAt": "2024-01-01T15:45:00.000Z",
  "analytics": [
    {
      "timestamp": "2024-01-01T15:30:00.000Z",
      "country": "US",
      "city": "New York",
      "referer": "https://google.com"
    }
  ]
}
```

#### GET /my-urls
**Purpose:** Get user's URL history with pagination (requires login)

**Request:**
```bash
curl "http://localhost:3001/my-urls?page=1&limit=10" \
  -H "X-Session-Id: Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"
```

**Response:**
```json
{
  "urls": [
    {
      "id": "url123",
      "shortCode": "Kx9mP2",
      "longUrl": "https://example.com/very/long/url",
      "shortUrl": "http://localhost:3001/Kx9mP2",
      "clicks": 5,
      "createdAt": "2024-01-01T10:30:00.000Z",
      "recentClicks": [
        {
          "timestamp": "2024-01-01T15:30:00.000Z",
          "country": "US",
          "city": "New York"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /analytics/:code
**Purpose:** Get detailed analytics for a URL (requires ownership)

**Request:**
```bash
curl "http://localhost:3001/analytics/Kx9mP2?page=1&limit=20" \
  -H "X-Session-Id: Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"
```

### GET /health
**Purpose:** Check if the server is running

**Example:**
```bash
curl http://localhost:3001/health
```

## 🗄️ Database Management

### View Database in Browser
```bash
# Opens a web interface to view your database
npm run db:studio
# Then open: http://localhost:5555
```

### Reset Database (Deletes All Data)
```bash
npm run db:migrate -- --reset
```

### Manual Database Access
```bash
# Connect to your database directly
psql -U postgres -d urlshortener

# View all URLs
SELECT * FROM urls;

# Count total URLs
SELECT COUNT(*) FROM urls;

# Exit database
\q
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests with detailed output
npm test -- --verbose

# Run tests and watch for changes
npm test -- --watch
```

## 📁 Project Structure

```
server/
├── server.js              # Main server file (all the API routes)
├── prisma/
│   └── schema.prisma      # Database structure definition
├── tests/
│   └── server.test.js     # Tests for the API
├── .env.example           # Template for environment variables
├── .env                   # Your actual environment variables (don't share this)
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (auto-restarts)
npm start           # Start production server
npm test            # Run tests
npm run db:migrate  # Update database structure
npm run db:generate # Generate database connection code
npm run db:studio   # Open database viewer in browser
```

## 🐛 Common Issues & Solutions

### "Database connection failed"
1. **Check if PostgreSQL is running:**
   ```bash
   # On macOS with Homebrew
   brew services start postgresql
   
   # On Ubuntu/Debian
   sudo service postgresql start
   
   # On Windows (if using Windows Subsystem for Linux)
   sudo service postgresql start
   ```

2. **Check if database exists:**
   ```bash
   psql -U postgres -l | grep urlshortener
   ```

3. **Create database if missing:**
   ```bash
   psql -U postgres -c "CREATE DATABASE urlshortener;"
   ```

### "Port 3001 already in use"
```bash
# Find what's using the port
lsof -i :3001

# Kill the process (replace <PID> with actual number)
kill -9 <PID>

# Or change the port in .env file
PORT=3002
```

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Prisma client not found"
```bash
# Generate the Prisma client
npm run db:generate
```

### Server won't start
1. **Check your .env file** - Make sure DATABASE_URL is correct
2. **Check Node.js version** - Must be 16 or higher
3. **Check database connection** - Can you connect with `psql`?
4. **Check logs** - Look at the error messages in terminal

## 🔍 Understanding the Code

### server.js - Main File
This file contains all the API routes:

- **Line ~30:** `POST /shorten` - Creates short URLs
- **Line ~90:** `GET /stats/:code` - Returns statistics
- **Line ~110:** `GET /:code` - Redirects to original URL
- **Line ~130:** `GET /health` - Health check

### How URL Shortening Works
1. **User sends long URL** → Server receives it
2. **Generate short code** → Uses `nanoid` to create random string
3. **Check if unique** → Makes sure code doesn't already exist
4. **Save to database** → Stores long URL + short code
5. **Return short URL** → Sends back the shortened version

### How Redirects Work
1. **User clicks short URL** → Server receives the short code
2. **Look up in database** → Find the original long URL
3. **Increment counter** → Add 1 to click count
4. **Redirect user** → Send them to the original URL

## 🚀 Next Steps

Once your server is running:

1. **Test all endpoints** - Use the curl commands above
2. **Start the frontend** - Go to the client folder and follow its README
3. **Make changes** - Edit server.js and see them reload automatically
4. **Add features** - Try adding new API endpoints
5. **Learn more** - Explore Express.js and Prisma documentation

## 📞 Need Help?

If something isn't working:
1. **Check the terminal** - Look for error messages
2. **Check your .env file** - Make sure database URL is correct
3. **Test database connection** - Can you connect with `psql`?
4. **Restart everything** - Stop the server and start again
5. **Check Node.js version** - Must be 16 or higher

The server should be running at: **http://localhost:3001**

Happy coding! 🚀