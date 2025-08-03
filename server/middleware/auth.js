const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple session-based authentication middleware
const authenticateUser = async (req, res, next) => {
  const sessionId = req.headers['x-session-id']; // Simple session ID in header

  if (!sessionId) {
    // Allow anonymous access - set user to null
    req.user = null;
    return next();
  }

  try {
    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token: sessionId },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      req.user = null;
      return next();
    }

    req.user = session.user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Please login to access this feature' });
  }
  next();
};

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip ||
         '127.0.0.1';
};

module.exports = {
  authenticateUser,
  requireAuth,
  getClientIP
};