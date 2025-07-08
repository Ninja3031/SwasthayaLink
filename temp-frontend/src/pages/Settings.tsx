import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Settings as SettingsIcon,
  Bell,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  Clock,
  User,
  Shield,
} from 'lucide-react';
import { mockUserSettings } from '../data/mockData';
import { UserSettings, CustomReminder } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', mockUserSettings);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditReminderModalOpen, setIsEditReminderModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<CustomReminder | null>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '',
  });

  const resetReminderForm = () => {
    setReminderForm({
      title: '',
      description: '',
      frequency: 'daily',
      time: '',
    });
  };

  const handleAddReminder = () => {
    if (reminderForm.title && reminderForm.time) {
      const newReminder: CustomReminder = {
        id: Date.now().toString(),
        title: reminderForm.title,
        description: reminderForm.description,
        frequency: reminderForm.frequency,
        time: reminderForm.time,
        enabled: true,
      };
      setSettings({
        ...settings,
        customReminders: [...settings.customReminders, newReminder],
      });
      setIsReminderModalOpen(false);
      resetReminderForm();
    }
  };

  const handleEditReminder = () => {
    if (selectedReminder && reminderForm.title && reminderForm.time) {
      const updatedReminders = settings.customReminders.map(reminder =>
        reminder.id === selectedReminder.id
          ? {
              ...reminder,
              title: reminderForm.title,
              description: reminderForm.description,
              frequency: reminderForm.frequency,
              time: reminderForm.time,
            }
          : reminder
      );
      setSettings({
        ...settings,
        customReminders: updatedReminders,
      });
      setIsEditReminderModalOpen(false);
      setSelectedReminder(null);
      resetReminderForm();
    }
  };

  const handleDeleteReminder = (id: string) => {
    setSettings({
      ...settings,
      customReminders: settings.customReminders.filter(reminder => reminder.id !== id),
    });
  };

  const handleToggleReminder = (id: string) => {
    const updatedReminders = settings.customReminders.map(reminder =>
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    );
    setSettings({
      ...settings,
      customReminders: updatedReminders,
    });
  };

  const openEditModal = (reminder: CustomReminder) => {
    setSelectedReminder(reminder);
    setReminderForm({
      title: reminder.title,
      description: reminder.description,
      frequency: reminder.frequency,
      time: reminder.time,
    });
    setIsEditReminderModalOpen(true);
  };

  const handleExportPDF = () => {
    // Simulate PDF generation
    alert('PDF export functionality would be implemented here. This would generate a comprehensive health summary including glucose readings, vital signs, medications, and appointments.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your preferences and account settings</p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Medication Reminders</h4>
                <p className="text-sm text-gray-500">Get notified when it's time to take your medications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.medicationReminders}
                  onChange={(e) => setSettings({ ...settings, medicationReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                <p className="text-sm text-gray-500">Get notified about upcoming appointments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.appointmentReminders}
                  onChange={(e) => setSettings({ ...settings, appointmentReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Reminders</h3>
            </div>
            <Button
              onClick={() => setIsReminderModalOpen(true)}
              icon={Plus}
              size="sm"
            >
              Add Reminder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.customReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder.enabled}
                      onChange={() => handleToggleReminder(reminder.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                    <p className="text-sm text-gray-500">
                      {reminder.description} • {reminder.frequency} at {reminder.time}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={() => openEditModal(reminder)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleDeleteReminder(reminder.id)}
                  />
                </div>
              </div>
            ))}
            {settings.customReminders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No custom reminders set up yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Health Summary PDF</h4>
              <p className="text-sm text-gray-500 mb-4">
                Generate a comprehensive PDF report of your health data including glucose readings, vital signs, medications, and appointments.
              </p>
              <Button
                onClick={handleExportPDF}
                icon={Download}
                variant="outline"
              >
                Export Health Summary
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" icon={User} className="h-12">
              Update Profile
            </Button>
            <Button variant="outline" icon={Shield} className="h-12">
              Privacy Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Add Custom Reminder"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reminder-title" className="block text-sm font-medium text-gray-700">
              Reminder Title *
            </label>
            <input
              type="text"
              id="reminder-title"
              value={reminderForm.title}
              onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Drink Water"
            />
          </div>

          <div>
            <label htmlFor="reminder-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="reminder-description"
              value={reminderForm.description}
              onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Drink a glass of water"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reminder-frequency" className="block text-sm font-medium text-gray-700">
                Frequency *
              </label>
              <select
                id="reminder-frequency"
                value={reminderForm.frequency}
                onChange={(e) => setReminderForm({ ...reminderForm, frequency: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label htmlFor="reminder-time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                id="reminder-time"
                value={reminderForm.time}
                onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReminder}>Add Reminder</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Custom Reminder Modal */}
      <Modal
        isOpen={isEditReminderModalOpen}
        onClose={() => setIsEditReminderModalOpen(false)}
        title="Edit Custom Reminder"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-reminder-title" className="block text-sm font-medium text-gray-700">
              Reminder Title *
            </label>
            <input
              type="text"
              id="edit-reminder-title"
              value={reminderForm.title}
              onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Drink Water"
            />
          </div>

          <div>
            <label htmlFor="edit-reminder-description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="edit-reminder-description"
              value={reminderForm.description}
              onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Drink a glass of water"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-reminder-frequency" className="block text-sm font-medium text-gray-700">
                Frequency *
              </label>
              <select
                id="edit-reminder-frequency"
                value={reminderForm.frequency}
                onChange={(e) => setReminderForm({ ...reminderForm, frequency: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-reminder-time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                id="edit-reminder-time"
                value={reminderForm.time}
                onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditReminderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReminder}>Update Reminder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};