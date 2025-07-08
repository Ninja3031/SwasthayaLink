import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import {
  Settings as SettingsIcon,
  Bell,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Shield,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import { mockDoctorUser } from '../../data/mockData';
import { User as UserType, TimeSlot } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const DoctorSettings: React.FC = () => {
  const [doctorProfile, setDoctorProfile] = useLocalStorage<UserType>('doctorProfile', mockDoctorUser);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditSlotModalOpen, setIsEditSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
  });

  const [notificationSettings, setNotificationSettings] = useLocalStorage('doctorNotificationSettings', {
    appointmentReminders: true,
    patientUpdates: true,
    labResults: true,
    prescriptionAlerts: true,
    systemUpdates: false,
  });

  const resetSlotForm = () => {
    setSlotForm({
      day: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
    });
  };

  const handleAddTimeSlot = () => {
    if (slotForm.day && slotForm.startTime && slotForm.endTime) {
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        day: slotForm.day,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        isAvailable: slotForm.isAvailable,
      };
      
      setDoctorProfile({
        ...doctorProfile,
        availableSlots: [...(doctorProfile.availableSlots || []), newSlot],
      });
      
      setIsAvailabilityModalOpen(false);
      resetSlotForm();
    }
  };

  const handleEditTimeSlot = () => {
    if (selectedSlot && slotForm.day && slotForm.startTime && slotForm.endTime) {
      const updatedSlots = (doctorProfile.availableSlots || []).map(slot =>
        slot.id === selectedSlot.id
          ? {
              ...slot,
              day: slotForm.day,
              startTime: slotForm.startTime,
              endTime: slotForm.endTime,
              isAvailable: slotForm.isAvailable,
            }
          : slot
      );
      
      setDoctorProfile({
        ...doctorProfile,
        availableSlots: updatedSlots,
      });
      
      setIsEditSlotModalOpen(false);
      setSelectedSlot(null);
      resetSlotForm();
    }
  };

  const handleDeleteTimeSlot = (id: string) => {
    const updatedSlots = (doctorProfile.availableSlots || []).filter(slot => slot.id !== id);
    setDoctorProfile({
      ...doctorProfile,
      availableSlots: updatedSlots,
    });
  };

  const openEditSlotModal = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSlotForm({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    });
    setIsEditSlotModalOpen(true);
  };

  const handleToggleNotification = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Settings</h1>
          <p className="text-gray-600">Manage your profile, availability, and preferences</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.specialization}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.licenseNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hospital</label>
                <p className="mt-1 text-sm text-gray-900">{doctorProfile.hospital}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" icon={Edit}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Availability Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Availability Schedule</h3>
            </div>
            <Button
              onClick={() => setIsAvailabilityModalOpen(true)}
              icon={Plus}
              size="sm"
            >
              Add Time Slot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(doctorProfile.availableSlots || []).map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${slot.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{slot.day}</h4>
                    <p className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditSlotModal(slot)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                  />
                </div>
              </div>
            ))}
            {(!doctorProfile.availableSlots || doctorProfile.availableSlots.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No availability slots configured</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                <p className="text-sm text-gray-500">Get notified about upcoming appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.appointmentReminders}
                  onChange={() => handleToggleNotification('appointmentReminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Patient Updates</h4>
                <p className="text-sm text-gray-500">Get notified when patients update their health data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.patientUpdates}
                  onChange={() => handleToggleNotification('patientUpdates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Lab Results</h4>
                <p className="text-sm text-gray-500">Get notified when lab results are available</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.labResults}
                  onChange={() => handleToggleNotification('labResults')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Prescription Alerts</h4>
                <p className="text-sm text-gray-500">Get notified about prescription fulfillment status</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.prescriptionAlerts}
                  onChange={() => handleToggleNotification('prescriptionAlerts')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">System Updates</h4>
                <p className="text-sm text-gray-500">Get notified about system maintenance and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.systemUpdates}
                  onChange={() => handleToggleNotification('systemUpdates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Professional Settings</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
              <input
                type="number"
                value={doctorProfile.consultationFee || 0}
                onChange={(e) => setDoctorProfile({ ...doctorProfile, consultationFee: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                value={doctorProfile.experience || 0}
                onChange={(e) => setDoctorProfile({ ...doctorProfile, experience: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Time Slot Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Add Availability Slot"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Day of Week *</label>
            <select
              value={slotForm.day}
              onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-available"
              checked={slotForm.isAvailable}
              onChange={(e) => setSlotForm({ ...slotForm, isAvailable: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is-available" className="ml-2 text-sm text-gray-700">
              Available for appointments
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAvailabilityModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeSlot}>Add Slot</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal
        isOpen={isEditSlotModalOpen}
        onClose={() => setIsEditSlotModalOpen(false)}
        title="Edit Availability Slot"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Day of Week *</label>
            <select
              value={slotForm.day}
              onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">Select day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-is-available"
              checked={slotForm.isAvailable}
              onChange={(e) => setSlotForm({ ...slotForm, isAvailable: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="edit-is-available" className="ml-2 text-sm text-gray-700">
              Available for appointments
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTimeSlot}>Update Slot</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};