import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  User,
  Edit,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Settings,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services';

export const Profile: React.FC = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAbhaModalOpen, setIsAbhaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    emergencyContact: user?.emergencyContact || '',
    photo: user?.photo || '',
  });
  const [abhaForm, setAbhaForm] = useState({
    abhaId: user?.abhaId || '',
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        emergencyContact: user.emergencyContact || '',
        photo: user.photo || '',
      });
      setAbhaForm({
        abhaId: user.abhaId || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile(editForm);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAbha = async () => {
    if (!abhaForm.abhaId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.linkAbhaId(abhaForm.abhaId);
      updateUser(updatedUser);
      setSuccess('ABHA ID linked successfully!');
      setIsAbhaModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to link ABHA ID');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        setEditForm({ ...editForm, photo: photoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show error if user is not found after loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and settings</p>
        </div>
        <div className="flex space-x-3">
          {!user?.abhaId && (
            <Button
              onClick={() => setIsAbhaModalOpen(true)}
              variant="outline"
              icon={CreditCard}
            >
              Link ABHA ID
            </Button>
          )}
          <Button
            onClick={() => setIsEditModalOpen(true)}
            icon={Edit}
            className="shadow-lg"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 mr-1" />
                  ABHA ID: {user?.abhaId || 'Not linked'}
                </div>
                {user?.abhaId && (
                  <div className="flex items-center text-sm text-green-600">
                    <Shield className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.gender || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ABHA ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{user?.abhaId || 'Not linked'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <p className="mt-1 text-sm text-gray-900">{user?.bloodGroup || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <div className="mt-1 flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{user?.emergencyContact || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" icon={Edit} className="h-12">
              Edit Profile
            </Button>
            <Button variant="outline" icon={Settings} className="h-12">
              Account Settings
            </Button>
            <Button variant="outline" icon={Shield} className="h-12">
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {editForm.photo ? (
                <img
                  src={editForm.photo}
                  alt={editForm.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <div>
              <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={editForm.dateOfBirth || ''}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                value={editForm.gender || ''}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                value={editForm.bloodGroup || ''}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
              Emergency Contact
            </label>
            <input
              type="tel"
              id="emergencyContact"
              value={editForm.emergencyContact || ''}
              onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ABHA ID Link Modal */}
      <Modal
        isOpen={isAbhaModalOpen}
        onClose={() => setIsAbhaModalOpen(false)}
        title="Link ABHA ID"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Link your ABHA (Ayushman Bharat Health Account) ID to enable seamless health data sharing across healthcare providers.
          </p>

          <div>
            <label htmlFor="abhaId" className="block text-sm font-medium text-gray-700">
              ABHA ID *
            </label>
            <input
              type="text"
              id="abhaId"
              value={abhaForm.abhaId}
              onChange={(e) => setAbhaForm({ ...abhaForm, abhaId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 12-3456-7890-1234"
              pattern="[0-9]{2}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: XX-XXXX-XXXX-XXXX
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsAbhaModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkAbha}
              disabled={isLoading || !abhaForm.abhaId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Linking...
                </>
              ) : (
                'Link ABHA ID'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};