const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/factsdb';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Fact Schema
const factSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true },
  source: { type: String, default: 'generator' },
  createdAt: { type: Date, default: Date.now }
});

const Fact = mongoose.model('Fact', factSchema);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// REST API endpoints
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
app.post('/api/facts', async (req, res) => {
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
