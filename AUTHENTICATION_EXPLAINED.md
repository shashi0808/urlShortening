# 🔐 Simple Authentication Explained

## How Our Authentication Works (Beginner-Friendly)

Instead of complex JWT tokens, we use **simple session-based authentication** that's easy to understand!

## 🎯 What Happens When You Login

### 1. **User Enters Email & Password**
```javascript
// User fills out login form
const formData = {
  email: "user@example.com",
  password: "mypassword"
};
```

### 2. **Frontend Sends Data to Backend**
```javascript
// Send login request
const response = await axios.post('/auth/login', formData);
```

### 3. **Backend Checks Password**
```javascript
// Backend verifies password
const isValidPassword = await bcrypt.compare(password, user.password);
```

### 4. **Backend Creates Simple Session**
```javascript
// Generate random session ID (like a ticket number)
const sessionId = nanoid(32); // Creates: "Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF"

// Save session in database
await prisma.session.create({
  data: {
    userId: user.id,
    token: sessionId,
    expiresAt: sevenDaysFromNow
  }
});
```

### 5. **Frontend Stores Session ID**
```javascript
// Store session ID in browser
localStorage.setItem('sessionId', response.data.sessionId);

// Add to all future requests
axios.defaults.headers.common['X-Session-Id'] = sessionId;
```

### 6. **Future Requests Include Session ID**
```javascript
// Every API call now includes:
// Headers: { 'X-Session-Id': 'Kx9mP2qR7vN3sL8wE5tY1uI4oA6zC0bF' }
```

## 🔍 How Backend Knows You're Logged In

### Authentication Middleware (Simple Check)
```javascript
const authenticateUser = async (req, res, next) => {
  const sessionId = req.headers['x-session-id']; // Get session ID from request
  
  if (!sessionId) {
    req.user = null; // No session = anonymous user
    return next();
  }
  
  // Look up session in database
  const session = await prisma.session.findUnique({
    where: { token: sessionId },
    include: { user: true }
  });
  
  if (session && session.expiresAt > new Date()) {
    req.user = session.user; // Valid session = logged in user
  } else {
    req.user = null; // Expired/invalid session = anonymous
  }
  
  next();
};
```

## 📊 Database Tables

### Users Table
```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,  -- Hashed with bcrypt
  name        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  token       TEXT UNIQUE NOT NULL,  -- Our session ID
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

### 1. **Password Hashing**
```javascript
// Never store plain passwords!
const hashedPassword = await bcrypt.hash(password, 12);
// "mypassword" becomes "$2b$12$Kx9mP2qR7vN3sL8wE5tY1u..."
```

### 2. **Session Expiration**
```javascript
// Sessions expire after 7 days
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);
```

### 3. **Secure Session IDs**
```javascript
// Random 32-character session IDs
const sessionId = nanoid(32); // Impossible to guess
```

## 🎯 Why This is Better for Beginners

### ❌ **JWT (Complex)**
- Requires understanding of tokens, signing, verification
- Complex error handling for expired tokens
- Need to understand public/private keys
- Stateless but harder to revoke

### ✅ **Simple Sessions (Easy)**
- Just a random ID stored in database
- Easy to understand: "Do you have a valid ticket?"
- Simple to revoke: Delete from database
- Clear expiration logic

## 🔄 Complete Flow Example

### Registration Flow
```
1. User fills form → Frontend
2. POST /auth/register → Backend
3. Hash password → Database
4. Create user → Database
5. Generate session ID → Backend
6. Store session → Database
7. Return session ID → Frontend
8. Store in localStorage → Browser
9. User is now logged in! ✅
```

### API Request Flow
```
1. User clicks "My URLs" → Frontend
2. GET /my-urls with session ID → Backend
3. Check session in database → Backend
4. If valid, get user's URLs → Database
5. Return URLs → Frontend
6. Display URLs → User sees their data ✅
```

### Logout Flow
```
1. User clicks "Logout" → Frontend
2. POST /auth/logout with session ID → Backend
3. Delete session from database → Backend
4. Remove from localStorage → Frontend
5. User is now logged out! ✅
```

## 🛠️ Implementation Tips

### Frontend (React)
```javascript
// Check if user is logged in
const sessionId = localStorage.getItem('sessionId');
if (sessionId) {
  // User is logged in
  axios.defaults.headers.common['X-Session-Id'] = sessionId;
}
```

### Backend (Express)
```javascript
// Protect routes that need authentication
app.get('/my-urls', requireAuth, async (req, res) => {
  // req.user is available here if logged in
  const urls = await prisma.url.findMany({
    where: { userId: req.user.id }
  });
});
```

## 🎓 Learning Benefits

This approach teaches:
- **Database relationships** - Users have many sessions
- **Middleware concepts** - Authentication checks
- **State management** - Storing login state
- **Security basics** - Password hashing, session expiration
- **HTTP headers** - Custom headers for authentication

**Much simpler than JWT, but just as secure for learning!** 🚀