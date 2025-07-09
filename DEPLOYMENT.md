# SwasthayaLink Deployment Guide

This guide will help you deploy the SwasthayaLink application with the backend on Render and frontends on Vercel.

## Prerequisites

- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account (for production database)

## Backend Deployment on Render

### 1. Prepare MongoDB Database

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user
4. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/swasthayalink`)

### 2. Deploy Backend

1. Push your code to GitHub
2. Go to Render Dashboard (https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `swasthayalink-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (generate one)
   - `CORS_ORIGIN`: Will be updated after frontend deployment

7. Deploy the service

### 3. Note Your Backend URL

After deployment, note your backend URL (e.g., `https://swasthayalink-backend.onrender.com`)

## Frontend Deployment on Vercel (Unified Portal)

### 1. Deploy Unified Frontend

1. Go to Vercel Dashboard (https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `temp-frontend` folder as the root directory
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://swasthayalink-backend.onrender.com`)

7. Deploy

### 2. Update Backend CORS

1. Go back to your Render dashboard
2. Update the `CORS_ORIGIN` environment variable with your Vercel URL:
   ```
   https://your-swasthayalink.vercel.app
   ```
3. Redeploy the backend service

### 3. Access the Application

- **Patient Portal**: `https://your-swasthayalink.vercel.app/`
- **Doctor Portal**: `https://your-swasthayalink.vercel.app/doctor`

The application will automatically redirect users to the appropriate portal based on their role after login.

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthayalink
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-swasthayalink.vercel.app
```

### Frontend (Vercel) - Unified Portal
```
VITE_API_URL=https://your-backend.onrender.com
```

## Post-Deployment Steps

1. Test all functionality:
   - User registration and login
   - Appointment booking
   - Medication management
   - Doctor-patient interactions

2. Monitor logs:
   - Check Render logs for backend issues
   - Check Vercel function logs for frontend issues

3. Set up monitoring:
   - Use Render's built-in monitoring
   - Consider adding error tracking (Sentry, etc.)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS_ORIGIN includes your frontend URLs
2. **Database Connection**: Verify MongoDB URI and network access
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Failures**: Check build logs for missing dependencies or syntax errors

### Logs

- **Render**: View logs in the Render dashboard under your service
- **Vercel**: View function logs in the Vercel dashboard

## Production Considerations

1. **Security**:
   - Use strong JWT secrets
   - Enable MongoDB authentication
   - Consider adding API rate limiting
   - Use HTTPS everywhere

2. **Performance**:
   - Consider upgrading to paid plans for better performance
   - Implement caching strategies
   - Optimize database queries

3. **Monitoring**:
   - Set up uptime monitoring
   - Monitor error rates
   - Track performance metrics

4. **Backup**:
   - Set up MongoDB Atlas backups
   - Consider code repository backups

## Support

If you encounter issues during deployment, check:
1. Service logs on Render/Vercel
2. Environment variable configuration
3. Network connectivity between services
4. Database connection and permissions
