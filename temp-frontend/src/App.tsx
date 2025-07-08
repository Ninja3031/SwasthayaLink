import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginForm } from './components/Auth/LoginForm';
import { ApiTest } from './components/Test/ApiTest';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { HealthRecords } from './pages/HealthRecords';
import { MedicationsPharmacy } from './pages/MedicationsPharmacy';
import { Appointments } from './pages/Appointments';
import { DiabetesCare } from './pages/DiabetesCare';
import { OCRReports } from './pages/OCRReports';
import { UHIIntegration } from './pages/UHIIntegration';
import { Notifications } from './pages/Notifications';
import { Messages } from './pages/Messages';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

// Doctor pages (to be implemented)
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientRecords } from './pages/doctor/PatientRecords';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorPrescriptions } from './pages/doctor/DoctorPrescriptions';
import { DoctorMessages } from './pages/doctor/DoctorMessages';
import { DoctorNotifications } from './pages/doctor/DoctorNotifications';
import { DoctorSettings } from './pages/doctor/DoctorSettings';
import { DoctorProfile } from './pages/doctor/DoctorProfile';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Login redirect route */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* API Test Route */}
          <Route path="/api-test" element={<ApiTest />} />

          {/* Patient Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="health-records" element={<HealthRecords />} />
            <Route path="medications" element={<MedicationsPharmacy />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="diabetes-care" element={<DiabetesCare />} />
            <Route path="ocr-reports" element={<OCRReports />} />
            <Route path="uhi-integration" element={<UHIIntegration />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<MainLayout />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="patients" element={<PatientRecords />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="messages" element={<DoctorMessages />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="settings" element={<DoctorSettings />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;