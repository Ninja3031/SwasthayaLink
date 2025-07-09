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
app.use(cors());
app.use(morgan('dev'));

// Rate Limiting (increased for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
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
