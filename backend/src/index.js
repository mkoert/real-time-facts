require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuthServer = require('@node-oauth/express-oauth-server');
const oauthModel = require('./oauth-model');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factsdb';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

// OAuth2 server for service-to-service auth (client credentials)
const oauth = new OAuthServer({ model: oauthModel });

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed the OAuth2 client for the data-generator
    if (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET) {
      await oauthModel.ensureClient(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Fact Schema
const factSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, default: 'generator' },
  createdAt: { type: Date, default: Date.now }
});

const Fact = mongoose.model('Fact', factSchema);

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || 'http://localhost/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Auth middleware — accepts session (Google OAuth) or bearer token (client credentials)
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();

  // Try OAuth2 bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return oauth.authenticate()(req, res, next);
  }

  res.status(401).json({ error: 'Unauthorized' });
}

// Store connected WebSocket clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast function to send data to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost');
  }
);

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, displayName: req.user.displayName, email: req.user.email });
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// OAuth2 token endpoint (client credentials grant for service-to-service)
app.post('/oauth/token', oauth.token());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// REST API endpoints (protected)
app.get('/api/facts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const facts = await Fact.find().sort({ createdAt: -1 }).limit(limit);
    res.json(facts);
  } catch (error) {
    console.error('Error fetching facts:', error);
    res.status(500).json({ error: 'Failed to fetch facts' });
  }
});

app.get('/api/facts/categories', async (req, res) => {
  try {
    const categories = await Fact.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/facts/stats', async (req, res) => {
  try {
    const total = await Fact.countDocuments();
    const byCategory = await Fact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ total, byCategory });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Internal endpoint for the data generator to add facts
// TODO:
app.post('/api/facts', requireAuth, async (req, res) => {
  try {
    const { text, category, source } = req.body;
    const fact = new Fact({ text, category, source: source || 'generator' });
    await fact.save();

    // Broadcast the new fact to all WebSocket clients
    broadcast({ type: 'NEW_FACT', payload: fact });

    res.status(201).json(fact);
  } catch (error) {
    console.error('Error creating fact:', error);
    res.status(500).json({ error: 'Failed to create fact' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
