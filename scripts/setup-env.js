#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 SwasthayaLink Environment Setup');
console.log('=====================================\n');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Create backend .env file
const backendEnv = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/swasthayalink

# JWT Configuration
JWT_SECRET=${jwtSecret}

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176

# For production, update these values:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthayalink
# CORS_ORIGIN=https://your-patient-frontend.vercel.app,https://your-doctor-frontend.vercel.app
`;

// Create frontend .env files
const frontendEnv = `# API Configuration
VITE_API_URL=http://localhost:3000

# For production deployment, replace with your deployed backend URL
# VITE_API_URL=https://your-backend-url.onrender.com
`;

// Write files
try {
  // Backend .env
  fs.writeFileSync('.env', backendEnv);
  console.log('✅ Created backend .env file');

  // Patient frontend .env
  fs.writeFileSync('temp-frontend/.env', frontendEnv);
  console.log('✅ Created patient frontend .env file');

  // Doctor frontend .env
  fs.writeFileSync('Doctorside/.env', frontendEnv);
  console.log('✅ Created doctor frontend .env file');

  console.log('\n🎉 Environment setup complete!');
  console.log('\nNext steps:');
  console.log('1. Start MongoDB locally or update MONGODB_URI in .env');
  console.log('2. Run "npm install" in the root directory');
  console.log('3. Run "npm run dev" to start the backend');
  console.log('4. Run "npm run dev" in temp-frontend/ for patient portal');
  console.log('5. Run "npm run dev" in Doctorside/ for doctor portal');
  console.log('\nFor deployment, see DEPLOYMENT.md');

} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
  process.exit(1);
}
