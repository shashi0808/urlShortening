const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const geoip = require("geoip-lite");
const { PrismaClient } = require("@prisma/client");
const { nanoid } = require("nanoid");
const validator = require("validator");
const { authenticateUser, getClientIP } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later" },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Authentication middleware
app.use(authenticateUser);

// Routes
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Utility function to validate URL
const isValidUrl = (url) => {
  try {
    return validator.isURL(url, {
      protocols: ["http", "https"],
      require_protocol: true,
    });
  } catch (error) {
    return false;
  }
};

// Utility function to sanitize short code
const isValidShortCode = (code) => {
  return /^[a-zA-Z0-9_-]{1,10}$/.test(code);
};

// POST /shorten - Create short URL
app.post("/shorten", async (req, res) => {
  try {
    const { longUrl } = req.body;

    // Validation
    if (!longUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if URL already exists for this user
    const whereClause = req.user
      ? { longUrl, userId: req.user.id }
      : { longUrl, userId: null };

    const existingUrl = await prisma.url.findFirst({
      where: whereClause,
    });

    if (existingUrl) {
      return res.json({
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
        shortCode: existingUrl.shortCode,
        longUrl: existingUrl.longUrl,
      });
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;

    while (!isUnique) {
      shortCode = nanoid(6);
      const existing = await prisma.url.findUnique({
        where: { shortCode },
      });
      if (!existing) isUnique = true;
    }

    // Create new URL record
    await prisma.url.create({
      data: {
        longUrl,
        shortCode,
        userId: req.user ? req.user.id : null,
      },
    });

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      longUrl,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /stats/:code - Get URL statistics (MUST come before /:code route)
app.get("/stats/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Validate short code format
    if (!isValidShortCode(code)) {
      return res.status(400).json({ error: "Invalid short code format" });
    }

    const url = await prisma.url.findUnique({
      where: { shortCode: code },
      include: {
        analytics: {
          orderBy: { timestamp: "desc" },
          take: 10, // Last 10 clicks
        },
      },
    });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Check if user owns this URL (for detailed analytics)
    const canViewDetails =
      !url.userId || (req.user && req.user.id === url.userId);

    const response = {
      shortCode: url.shortCode,
      longUrl: url.longUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };

    // Add detailed analytics if user owns the URL
    if (canViewDetails) {
      response.analytics = url.analytics.map((a) => ({
        timestamp: a.timestamp,
        country: a.country,
        city: a.city,
        referer: a.referer,
      }));
    }

    res.json(response);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /my-urls - Get user's URL history with pagination
app.get("/my-urls", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [urls, totalCount] = await Promise.all([
      prisma.url.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          analytics: {
            select: {
              timestamp: true,
              country: true,
              city: true,
            },
            orderBy: { timestamp: "desc" },
            take: 5,
          },
        },
      }),
      prisma.url.count({
        where: { userId: req.user.id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      urls: urls.map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        longUrl: url.longUrl,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
        recentClicks: url.analytics,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /analytics/:code - Get detailed analytics for a URL
app.get("/analytics/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const url = await prisma.url.findUnique({
      where: { shortCode: code },
    });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Check if user owns this URL
    if (url.userId && (!req.user || req.user.id !== url.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [analytics, totalCount] = await Promise.all([
      prisma.analytics.findMany({
        where: { urlId: url.id },
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.analytics.count({
        where: { urlId: url.id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      analytics: analytics.map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        ipAddress: a.ipAddress.replace(/\.\d+$/, ".***"), // Mask last octet for privacy
        country: a.country,
        city: a.city,
        referer: a.referer,
        userAgent: a.userAgent,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:code - Redirect to original URL (MUST come after /stats/:code route)
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Validate short code format
    if (!isValidShortCode(code)) {
      return res.status(400).json({ error: "Invalid short code format" });
    }

    const url = await prisma.url.findUnique({
      where: { shortCode: code },
    });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // Get client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers["user-agent"] || "";
    const referer = req.headers["referer"] || req.headers["referrer"] || "";

    // Get location from IP
    const geo = geoip.lookup(clientIP);
    const country = geo ? geo.country : null;
    const city = geo ? geo.city : null;

    // Record analytics and increment counter
    await Promise.all([
      prisma.analytics.create({
        data: {
          urlId: url.id,
          ipAddress: clientIP,
          userAgent,
          referer,
          country,
          city,
        },
      }),
      prisma.url.update({
        where: { shortCode: code },
        data: { clicks: { increment: 1 } },
      }),
    ]);

    res.redirect(url.longUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
