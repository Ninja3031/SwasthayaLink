import React, { useState } from 'react';
import { Eye, EyeOff, User, UserCheck, Stethoscope, Heart } from 'lucide-react';

interface UnifiedAuthProps {
  onPatientAuth: (credentials: any) => Promise<void>;
  onDoctorAuth: (credentials: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

type UserRole = 'patient' | 'doctor';
type AuthMode = 'signin' | 'signup';

export const UnifiedAuth: React.FC<UnifiedAuthProps> = ({
  onPatientAuth,
  onDoctorAuth,
  isLoading = false,
  error = ''
}) => {
  const [step, setStep] = useState<'role-selection' | 'auth'>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Doctor-specific fields
    specialization: '',
    licenseNumber: '',
    hospital: '',
    yearsOfExperience: '',
  });

  const handleRoleSelection = (role: UserRole, mode: AuthMode) => {
    setSelectedRole(role);
    setAuthMode(mode);
    setStep('auth');
    // Reset form data when switching roles
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      hospital: '',
      yearsOfExperience: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      if (selectedRole === 'patient') {
        const patientData = authMode === 'signin' 
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              role: 'user'
            };
        await onPatientAuth(patientData);
      } else {
        const doctorData = authMode === 'signin'
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              role: 'doctor',
              specialization: formData.specialization,
              licenseNumber: formData.licenseNumber,
              hospital: formData.hospital,
              yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
            };
        await onDoctorAuth(doctorData);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const goBack = () => {
    setStep('role-selection');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      specialization: '',
      licenseNumber: '',
      hospital: '',
      yearsOfExperience: '',
    });
  };

  if (step === 'role-selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-indigo-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to SwasthayaLink
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose your role to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* Patient Options */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">I'm a Patient</h3>
              </div>
              <p className="text-gray-600 mb-4">Access your health records, book appointments, and manage medications</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRoleSelection('patient', 'signin')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleRoleSelection('patient', 'signup')}
                  className="flex-1 bg-blue-100 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Doctor Options */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-green-500 transition-colors">
              <div className="flex items-center mb-4">
                <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">I'm a Doctor</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage patients, appointments, and provide medical consultations</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRoleSelection('doctor', 'signin')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleRoleSelection('doctor', 'signup')}
                  className="flex-1 bg-green-100 text-green-600 py-2 px-4 rounded-md hover:bg-green-200 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleColor = selectedRole === 'patient' ? 'blue' : 'green';
  const RoleIcon = selectedRole === 'patient' ? User : Stethoscope;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <RoleIcon className={`mx-auto h-12 w-12 text-${roleColor}-600`} />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {selectedRole === 'patient' ? 'Patient' : 'Doctor'} {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={goBack}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to role selection
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <input
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <input
                  name="phone"
                  type="tel"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>

            {authMode === 'signup' && (
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            )}

            {/* Doctor-specific fields for signup */}
            {authMode === 'signup' && selectedRole === 'doctor' && (
              <>
                <div>
                  <input
                    name="specialization"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Specialization (e.g., Cardiology)"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    name="licenseNumber"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Medical License Number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    name="hospital"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Hospital/Clinic Name"
                    value={formData.hospital}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    name="yearsOfExperience"
                    type="number"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Years of Experience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${roleColor}-600 hover:bg-${roleColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${roleColor}-500 disabled:opacity-50`}
            >
              {isLoading ? 'Loading...' : `${authMode === 'signin' ? 'Sign In' : 'Sign Up'} as ${selectedRole === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
