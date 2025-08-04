// mainserver.js - Process Manager that starts all 4 backend servers
require("dotenv").config();
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const cors = require('cors');

console.log('🚀 Starting Mozartify Backend Services...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Working Directory: ${process.cwd()}`);

// Track all child processes
const processes = [];
const isProduction = process.env.NODE_ENV === "production";

// Function to start a server
function startServer(fileName, port, serviceName) {
  console.log(`🔄 Starting ${serviceName} (${fileName}) on port ${port}...`);
  
  const serverPath = path.join(__dirname, fileName);
  const child = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { 
      ...process.env, 
      PORT: port,
      SERVER_NAME: serviceName
    }
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
    if (output && !output.includes('DeprecationWarning')) {
      console.error(`[${serviceName}:${port}] ERROR: ${output}`);
    }
  });

  // Handle process exit
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ ${serviceName} (${fileName}) exited with code ${code}`);
      // In production, try to restart the service
      if (isProduction) {
        console.log(`🔄 Attempting to restart ${serviceName}...`);
        setTimeout(() => startServer(fileName, port, serviceName), 5000);
      }
    } else {
      console.log(`✅ ${serviceName} (${fileName}) exited normally`);
    }
  });

  // Handle process errors
  child.on('error', (err) => {
    console.error(`❌ Failed to start ${serviceName} (${fileName}):`, err.message);
  });

  processes.push({ child, serviceName, port, fileName });
  return child;
}

// Define server configurations
const serverConfigs = [
  { file: 'index.js', port: 3000, name: 'Main API' },
  { file: 'server.js', port: 3001, name: 'Music/Arts API' },
  { file: 'inbox.js', port: 3002, name: 'Feedback API' },
  { file: 'admin.js', port: 3003, name: 'Admin API' }
];

// Start all servers
serverConfigs.forEach(({ file, port, name }) => {
  startServer(file, port, name);
});

// Create a health check and proxy server on the main port for Render
const app = express();
const MAIN_PORT = process.env.PORT || 10000; // Render will use this

// CORS configuration
const frontendUrl = isProduction
  ? process.env.FRONTEND_PROD_URL
  : process.env.FRONTEND_DEV_URL;

const allowedOrigins = [
  frontendUrl,
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
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

// Health check endpoint for Render
app.get('/', (req, res) => {
  const baseUrl = isProduction ? `https://${req.get('host')}` : 'http://localhost';
  
  res.json({
    message: '🎵 Mozartify Backend Services are running!',
    status: 'healthy',
    services: {
      'Main API': `${baseUrl}:3000`,
      'Music/Arts API': `${baseUrl}:3001`, 
      'Feedback API': `${baseUrl}:3002`,
      'Admin API': `${baseUrl}:3003`
    },
    environment: process.env.NODE_ENV || 'development',
    processManager: 'mainserver.js',
    activeProcesses: processes.length,
    timestamp: new Date().toISOString()
  });
});

// Health check for all services
app.get('/health', async (req, res) => {
  const serviceStatus = {};
  
  processes.forEach(({ serviceName, port, child }) => {
    serviceStatus[`${serviceName} (${port})`] = child.killed ? 'down' : 'up';
  });

  res.json({
    status: 'healthy',
    services: serviceStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Simple proxy endpoints to route requests to appropriate services
// Main API routes (index.js - port 3000)
app.use(['/login', '/register', '/logout', '/set-favorites', '/add-to-cart', '/complete-purchase', '/recommendations', '/create-payment-intent'], (req, res) => {
  res.status(200).json({
    message: 'Route handled by Main API service on port 3000',
    note: 'Your frontend should call port 3000 directly for these routes'
  });
});

// Music/Arts API routes (server.js - port 3001)
app.use(['/predictEmotion', '/predictGender', '/predictGenre', '/abc-file', '/arts-dynamic-fields', '/music-dynamic-fields'], (req, res) => {
  res.status(200).json({
    message: 'Route handled by Music/Arts API service on port 3001',
    note: 'Your frontend should call port 3001 directly for these routes'
  });
});

// Feedback API routes (inbox.js - port 3002)
app.use(['/api/feedback', '/api/artwork-feedback'], (req, res) => {
  res.status(200).json({
    message: 'Route handled by Feedback API service on port 3002',
    note: 'Your frontend should call port 3002 directly for these routes'
  });
});

// Admin API routes (admin.js - port 3003)
app.use(['/users', '/admin/stats', '/admin/feedbacks'], (req, res) => {
  res.status(200).json({
    message: 'Route handled by Admin API service on port 3003',
    note: 'Your frontend should call port 3003 directly for these routes'
  });
});

// Start the main health check server
app.listen(MAIN_PORT, '0.0.0.0', () => {
  console.log(`\n🎯 Main Process Manager running on port ${MAIN_PORT}`);
  console.log(`📊 Health check: http://localhost:${MAIN_PORT}/health`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log('\n✅ All Mozartify Backend Services started!\n');
  
  // Log service endpoints
  console.log('📡 Service Endpoints:');
  serverConfigs.forEach(({ name, port }) => {
    console.log(`   ${name}: http://localhost:${port}`);
  });
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down all services...');
  processes.forEach(({ child, serviceName }) => {
    console.log(`🔄 Stopping ${serviceName}...`);
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
  setTimeout(() => process.exit(0), 5000); // Force exit after 5 seconds
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down all services...');
  processes.forEach(({ child, serviceName }) => {
    console.log(`🔄 Stopping ${serviceName}...`);
    if (!child.killed) {
      child.kill('SIGINT');
    }
  });
  setTimeout(() => process.exit(0), 5000); // Force exit after 5 seconds
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  processes.forEach(({ child }) => {
    if (!child.killed) {
      child.kill();
    }
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  processes.forEach(({ child }) => {
    if (!child.killed) {
      child.kill();
    }
  });
  process.exit(1);
});

console.log('🔥 Process Manager initialized. Waiting for services to start...');