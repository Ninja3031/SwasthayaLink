# Frontend-Backend Connection Guide

## Overview
Your SwasthayaLink application now has a fully connected frontend and backend over port 3000.

## Architecture
- **Backend**: Express.js server running on `http://localhost:3000`
- **Frontend**: React/Vite application running on `http://localhost:5174`
- **Proxy**: Vite dev server proxies `/api/*` requests to the backend

## How to Run

### 1. Start the Backend
```bash
# In the root directory
npm run dev
```
This starts the Express server on port 3000.

### 2. Start the Frontend
```bash
# In the temp-frontend directory
cd temp-frontend
npm run dev
```
This starts the Vite dev server (usually on port 5174).

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/abha` - Link ABHA ID

### Health Data
- `POST /api/healthdata` - Add health data entry
- `GET /api/healthdata` - Get all health data for user
- `PUT /api/healthdata/:id` - Update health data entry
- `DELETE /api/healthdata/:id` - Delete health data entry

### Reports
- `POST /api/reports/upload` - Upload report file
- `GET /api/reports` - Get all reports for user
- `GET /api/reports/:id` - Get specific report
- `DELETE /api/reports/:id` - Delete report

## Testing the Connection

### Method 1: API Test Page
1. Open http://localhost:5174 in your browser
2. Register a new account or login
3. Navigate to http://localhost:5174/api-test
4. Test adding health data entries
5. Verify data is saved and retrieved from the backend

### Method 2: Browser Network Tab
1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform actions in the app
4. Watch for API calls to `/api/*` endpoints

### Method 3: Backend Logs
Watch the backend terminal for incoming requests and responses.

## Key Files Created

### Frontend API Layer
- `temp-frontend/src/services/api.ts` - Axios configuration
- `temp-frontend/src/services/authService.ts` - Authentication API calls
- `temp-frontend/src/services/healthDataService.ts` - Health data API calls
- `temp-frontend/src/services/reportService.ts` - Report API calls
- `temp-frontend/src/hooks/useAuth.ts` - Authentication state management
- `temp-frontend/src/hooks/useHealthData.ts` - Health data state management

### Configuration
- `temp-frontend/vite.config.ts` - Proxy configuration for API calls

## Authentication Flow
1. User registers/logs in through the frontend
2. Backend returns JWT token
3. Token is stored in localStorage
4. All subsequent API calls include the token in Authorization header
5. Backend middleware validates the token for protected routes

## Error Handling
- Network errors are caught and displayed to users
- 401 errors automatically redirect to login
- Form validation prevents invalid data submission

## Next Steps
1. Replace mock data in existing components with real API calls
2. Add more API endpoints as needed
3. Implement file upload for reports
4. Add real-time features with WebSockets if needed

## Troubleshooting

### CORS Issues
The backend has CORS enabled for all origins in development.

### Port Conflicts
- Backend uses port 3000 (configurable in .env)
- Frontend uses port 5174 (Vite auto-selects available port)

### MongoDB Connection
Ensure MongoDB is running locally on the default port (27017).

### Authentication Issues
Check browser localStorage for the 'authToken' key.
