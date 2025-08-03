# URL Shortener App

A complete full-stack URL shortener application with user authentication, advanced analytics, and paginated history. Perfect for learning Node.js and React!

## 🚀 Quick Setup

```bash
# 0. Check if you have everything needed
npm run check

# 1. Install everything
npm run install:all

# 2. Set up database
cd server
cp .env.example .env
# Edit .env with your PostgreSQL details
npm run db:migrate
npm run db:generate
cd ..

# 3. Start both services
npm run dev
```

**Your app will be running at:**
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:3001

## ✨ What This App Does

- **Shortens URLs** - Turn long URLs into short, shareable links
- **User Authentication** - Register/login with simple session-based auth
- **Advanced Analytics** - IP tracking, timestamps, location data
- **Paginated History** - View all your URLs with pagination
- **Detailed Statistics** - Click counts, visitor locations, referrers
- **Anonymous Usage** - Works without login, enhanced with account
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Copy to Clipboard** - Easy copying of short URLs

## 📚 Detailed Setup Instructions

### For Backend (Server):
👉 **[server/README.md](server/README.md)** - Complete backend setup guide
- Database setup with 4 tables
- Authentication system
- Environment configuration
- API testing with curl commands
- Troubleshooting common issues

### For Frontend (Client):
👉 **[client/README.md](client/README.md)** - Complete frontend setup guide
- React development server
- Authentication components
- Component explanations
- UI testing procedures
- Styling and customization

### Authentication Explained:
👉 **[AUTHENTICATION_EXPLAINED.md](AUTHENTICATION_EXPLAINED.md)** - Beginner-friendly auth guide
- How simple sessions work
- Why we chose this over JWT
- Step-by-step authentication flow
- Security features explained

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- Simple Session Authentication (beginner-friendly)
- bcrypt for password hashing
- IP geolocation tracking (geoip-lite)
- Rate limiting protection
- Jest for testing

**Frontend:**
- React.js with hooks
- React Router for navigation
- Axios for API calls
- User authentication UI
- Paginated data display
- Real-time backend health check

## 📁 Project Structure

```
url-shortener/
├── 📄 Documentation
│   ├── README.md                    # Main project overview
│   ├── AUTHENTICATION_EXPLAINED.md # How authentication works
│   ├── FINAL_CHECKLIST.md          # Complete feature checklist
│   ├── LICENSE                     # MIT License
│   └── check-prerequisites.js      # Prerequisites checker
├── 🔧 Backend (server/)
│   ├── server.js                   # Main API server
│   ├── middleware/auth.js          # Authentication middleware
│   ├── routes/auth.js              # Authentication routes
│   ├── prisma/schema.prisma        # Database schema (4 tables)
│   ├── tests/server.test.js        # API tests
│   └── README.md                   # 👈 Detailed backend setup
├── 🎨 Frontend (client/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js             # URL shortening form
│   │   │   ├── Login.js            # Login form
│   │   │   ├── Register.js         # Registration form
│   │   │   ├── MyUrls.js           # User's URL history (paginated)
│   │   │   ├── Stats.js            # URL statistics
│   │   │   └── HealthCheck.js      # Backend connection check
│   │   ├── App.js                  # Main app with authentication
│   │   └── index.css               # Complete styling
│   └── README.md                   # 👈 Detailed frontend setup
├── package.json                    # Root scripts
└── test-setup.js                   # End-to-end testing
```

## ⚡ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run check` | Check if all prerequisites are installed |
| `npm run install:all` | Install dependencies for both server and client |
| `npm run dev` | Start both backend and frontend |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:server` | Run backend tests only |
| `npm run build` | Build frontend for production |

## 🔧 Prerequisites

1. **Node.js** (v16+) - [Download here](https://nodejs.org/)
2. **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
3. **Code Editor** - VS Code recommended

## 🧪 Testing

```bash
# Test everything works
npm run test:e2e

# Test just the backend
npm run test:server
```

## 🎯 For Beginners

This project is perfect for learning:
- **REST APIs** - How frontend and backend communicate
- **Database Operations** - Storing and retrieving data with relationships
- **Authentication** - Simple session-based login system
- **React Components** - Building user interfaces with state
- **State Management** - Managing application data
- **Pagination** - Handling large datasets
- **Security** - Password hashing, rate limiting, input validation
- **Full-Stack Development** - Connecting all the pieces

## 🔐 Authentication Features

### Simple Session-Based Auth (Beginner-Friendly)
- **No JWT complexity** - Uses simple session IDs
- **Easy to understand** - "Do you have a valid session ticket?"
- **Secure** - bcrypt password hashing, session expiration
- **Optional** - App works without login, enhanced with account

### User Features
- **Registration** - Create account with email/password
- **Login/Logout** - Persistent sessions
- **My URLs** - View all your shortened URLs with pagination
- **Detailed Analytics** - See who clicked your links and when

## 📊 Database Schema

### 4 Tables for Complete Functionality:
1. **Users** - Store user accounts
2. **Sessions** - Manage login sessions
3. **URLs** - Store shortened URLs (with optional user ownership)
4. **Analytics** - Detailed click tracking with IP, location, timestamps

## 🚀 Getting Started

1. **Start with the backend** - Follow [server/README.md](server/README.md)
2. **Then setup the frontend** - Follow [client/README.md](client/README.md)
3. **Learn about authentication** - Read [AUTHENTICATION_EXPLAINED.md](AUTHENTICATION_EXPLAINED.md)
4. **Test everything** - Use the app at http://localhost:3000

## 📞 Need Help?

- **Backend issues** - Check [server/README.md](server/README.md) troubleshooting section
- **Frontend issues** - Check [client/README.md](client/README.md) troubleshooting section
- **Authentication questions** - Read [AUTHENTICATION_EXPLAINED.md](AUTHENTICATION_EXPLAINED.md)
- **General setup** - Make sure Node.js and PostgreSQL are installed

## 🎓 Learning Path

### Beginner Level:
1. **Basic Setup** - Get the app running
2. **Understand Structure** - Explore the file organization
3. **Try Features** - Create URLs, register account, view stats

### Intermediate Level:
1. **Study Authentication** - How sessions work
2. **Explore Database** - Understand table relationships
3. **Modify Components** - Change UI or add features

### Advanced Level:
1. **Add New Features** - Custom short codes, URL expiration
2. **Deploy to Production** - Host on cloud platforms
3. **Scale the System** - Add caching, load balancing

## 📄 License

MIT License - free to use for learning and personal projects!