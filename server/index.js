require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const enrichRoutes = require('./routes/enrich');
const creditsRoutes = require('./routes/credits');
const notificationRoutes = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const filesRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://prospecto-production-alb-275793155.us-east-1.elb.amazonaws.com',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/enrich', enrichRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', filesRoutes);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
