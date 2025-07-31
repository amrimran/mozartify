// mainserver.js - Process Manager that starts all 4 backend servers
require("dotenv").config();
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mozartify Backend Services...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Working Directory: ${process.cwd()}`);

// Track all child processes
const processes = [];

// Function to start a server
function startServer(fileName, port, serviceName) {
  console.log(`🔄 Starting ${serviceName} (${fileName}) on port ${port}...`);
  
  const serverPath = path.join(__dirname, fileName);
  const child = spawn('node', [serverPath], {
    stdio: 'pipe',
    env: { ...process.env, PORT: port }
  });

  // Handle stdout (normal output)
  child.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.log(`[${serviceName}:${port}] ${output}`);
    }
  });

  // Handle stderr (error output)
  child.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      console.error(`[${serviceName}:${port}] ERROR: ${output}`);
    }
  });

  // Handle process exit
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ ${serviceName} (${fileName}) exited with code ${code}`);
    } else {
      console.log(`✅ ${serviceName} (${fileName}) exited normally`);
    }
  });

  // Handle process errors
  child.on('error', (err) => {
    console.error(`❌ Failed to start ${serviceName} (${fileName}):`, err.message);
  });

  processes.push({ child, serviceName, port });
  return child;
}

// Start all 4 servers
const servers = [
  { file: 'index.js', port: 3000, name: 'Main API' },
  { file: 'server.js', port: 3001, name: 'Music/Arts API' },
  { file: 'inbox.js', port: 3002, name: 'Feedback API' },
  { file: 'admin.js', port: 3003, name: 'Admin API' }
];

// Start all servers
servers.forEach(({ file, port, name }) => {
  startServer(file, port, name);
});

// Create a simple health check server on the main port for Render
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const MAIN_PORT = process.env.PORT || 10000; // Render will use this

// CORS configuration
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = isProduction
  ? process.env.FRONTEND_PROD_URL
  : process.env.FRONTEND_DEV_URL;

const allowedOrigins = [
  frontendUrl,
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
  'https://mozartifynasirum.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎵 Mozartify Backend Services are running!',
    status: 'healthy',
    services: {
      'Main API': 'http://localhost:3000',
      'Music/Arts API': 'http://localhost:3001', 
      'Feedback API': 'http://localhost:3002',
      'Admin API': 'http://localhost:3003'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check for all services
app.get('/health', async (req, res) => {
  const serviceChecks = await Promise.allSettled([
    axios.get('http://localhost:3000').catch(() => ({ status: 'down' })),
    axios.get('http://localhost:3001').catch(() => ({ status: 'down' })),
    axios.get('http://localhost:3002').catch(() => ({ status: 'down' })),
    axios.get('http://localhost:3003').catch(() => ({ status: 'down' }))
  ]);

  const serviceStatus = {
    'Main API (3000)': serviceChecks[0].status === 'fulfilled' ? 'up' : 'down',
    'Music/Arts API (3001)': serviceChecks[1].status === 'fulfilled' ? 'up' : 'down',
    'Feedback API (3002)': serviceChecks[2].status === 'fulfilled' ? 'up' : 'down',
    'Admin API (3003)': serviceChecks[3].status === 'fulfilled' ? 'up' : 'down'
  };

  res.json({
    status: 'healthy',
    services: serviceStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Proxy requests to appropriate services based on path
app.use('/api/main/*', (req, res) => {
  const targetUrl = `http://localhost:3000${req.originalUrl.replace('/api/main', '')}`;
  // Simple proxy - in production you might want to use http-proxy-middleware
  res.redirect(307, targetUrl);
});

app.use('/api/music/*', (req, res) => {
  const targetUrl = `http://localhost:3001${req.originalUrl.replace('/api/music', '')}`;
  res.redirect(307, targetUrl);
});

app.use('/api/feedback/*', (req, res) => {
  const targetUrl = `http://localhost:3002${req.originalUrl.replace('/api/feedback', '')}`;
  res.redirect(307, targetUrl);
});

app.use('/api/admin/*', (req, res) => {
  const targetUrl = `http://localhost:3003${req.originalUrl.replace('/api/admin', '')}`;
  res.redirect(307, targetUrl);
});

// Start the main health check server
app.listen(MAIN_PORT, '0.0.0.0', () => {
  console.log(`\n🎯 Main Health Check Server running on port ${MAIN_PORT}`);
  console.log(`📊 Health check: http://localhost:${MAIN_PORT}/health`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log('\n✅ All Mozartify Backend Services are starting up...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down all services...');
  processes.forEach(({ child, serviceName }) => {
    console.log(`🔄 Stopping ${serviceName}...`);
    child.kill('SIGTERM');
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down all services...');
  processes.forEach(({ child, serviceName }) => {
    console.log(`🔄 Stopping ${serviceName}...`);
    child.kill('SIGINT');
  });
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  processes.forEach(({ child }) => child.kill());
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  processes.forEach(({ child }) => child.kill());
  process.exit(1);
});