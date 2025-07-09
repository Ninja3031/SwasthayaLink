require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reportRoutes = require('./routes/report');
const healthDataRoutes = require('./routes/healthData');
const medicationRoutes = require('./routes/medication');
const appointmentRoutes = require('./routes/appointment');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const glucoseTargetRoutes = require('./routes/glucoseTargets');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Stricter limits in production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Auth routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/reports', reportRoutes);
app.use('/healthdata', healthDataRoutes);
app.use('/medications', medicationRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/doctor', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/glucose-targets', glucoseTargetRoutes);

// Routes placeholder
app.get('/', (req, res) => {
  res.send('SwasthiyaLink API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
