import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Activity,
  Calendar,
  Pill,
  FileText,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  Heart,
  Weight,
  Loader2,
  Bell,
} from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useAppointments } from '../hooks/useAppointments';
import { useMedications } from '../hooks/useMedications';
import { useGlucoseTargets } from '../hooks/useGlucoseTargets';

export const Dashboard: React.FC = () => {
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [isBPModalOpen, setIsBPModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGlucoseReading, setNewGlucoseReading] = useState({
    value: '',
    type: 'fasting' as 'fasting' | 'random' | 'post_meal',
    notes: '',
  });
  const [newBPReading, setNewBPReading] = useState({
    systolic: '',
    diastolic: '',
    notes: '',
  });
  const [newWeightReading, setNewWeightReading] = useState({
    value: '',
    notes: '',
  });

  const { user } = useAuth();
  const { healthData, addHealthData, getHealthDataByType, getLatestReading, isLoading, error } = useHealthData();
  const { notifications } = useNotifications();
  const { getUpcomingAppointments } = useAppointments();
  const { medications } = useMedications();
  const { targets } = useGlucoseTargets();

  // Get health data by type
  const glucoseReadings = getHealthDataByType('glucose');
  const bloodPressureReadings = getHealthDataByType('blood_pressure_systolic');
  const weightReadings = getHealthDataByType('weight');
  const heartRateReadings = getHealthDataByType('heart_rate');

  // Get latest readings
  const latestGlucoseReading = getLatestReading('glucose');
  const latestBPSystolicReading = getLatestReading('blood_pressure_systolic');
  const latestBPDiastolicReading = getLatestReading('blood_pressure_diastolic');
  const latestWeightReading = getLatestReading('weight');
  const latestHeartRateReading = getLatestReading('heart_rate');

  // Get real data from hooks
  const upcomingAppointments = getUpcomingAppointments().slice(0, 3);
  const todayMedications = medications.filter((med) => {
    const today = new Date();
    const startDate = new Date(med.startDate);
    const endDate = new Date(med.endDate);
    return today >= startDate && today <= endDate && med.isActive;
  });

  // Get today's glucose reminders
  const todayGlucoseReminders = targets?.reminderEnabled ? targets.reminderTimes.filter(reminder => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return reminder.enabled && targets.reminderDays.includes(today);
  }) : [];

  // Calculate predicted glucose (simple prediction based on latest reading)
  const predictedGlucose = latestGlucoseReading?.value
    ? Math.round(Number(latestGlucoseReading.value) * 0.95)
    : 0;

  const handleAddGlucoseReading = async () => {
    if (!newGlucoseReading.value) return;

    setIsSubmitting(true);
    try {
      await addHealthData({
        type: 'glucose',
        value: parseFloat(newGlucoseReading.value),
        unit: 'mg/dL',
      });

      setNewGlucoseReading({ value: '', type: 'fasting', notes: '' });
      setIsGlucoseModalOpen(false);
    } catch (error) {
      console.error('Failed to add glucose reading:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBPReading = async () => {
    if (!newBPReading.systolic || !newBPReading.diastolic) return;

    setIsSubmitting(true);
    try {
      // Add systolic reading
      await addHealthData({
        type: 'blood_pressure_systolic',
        value: parseFloat(newBPReading.systolic),
        unit: 'mmHg',
      });

      // Add diastolic reading
      await addHealthData({
        type: 'blood_pressure_diastolic',
        value: parseFloat(newBPReading.diastolic),
        unit: 'mmHg',
      });

      setNewBPReading({ systolic: '', diastolic: '', notes: '' });
      setIsBPModalOpen(false);
    } catch (error) {
      console.error('Failed to add BP reading:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWeightReading = async () => {
    if (!newWeightReading.value) return;

    setIsSubmitting(true);
    try {
      await addHealthData({
        type: 'weight',
        value: parseFloat(newWeightReading.value),
        unit: 'kg',
      });

      setNewWeightReading({ value: '', notes: '' });
      setIsWeightModalOpen(false);
    } catch (error) {
      console.error('Failed to add weight reading:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your health overview.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsGlucoseModalOpen(true)}
            icon={Plus}
            className="shadow-lg"
            disabled={isLoading}
          >
            Add Glucose Reading
          </Button>
          <Button
            onClick={() => setIsBPModalOpen(true)}
            icon={Plus}
            variant="secondary"
            className="shadow-lg"
            disabled={isLoading}
          >
            Add BP Reading
          </Button>
          <Button
            onClick={() => setIsWeightModalOpen(true)}
            icon={Weight}
            variant="outline"
            className="shadow-lg"
            disabled={isLoading}
          >
            Add Weight
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading health data: {error}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Glucose Reading</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {latestGlucoseReading?.value || '--'} {latestGlucoseReading?.unit || 'mg/dL'}
                  </p>
                )}
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              {latestGlucoseReading?.date
                ? new Date(latestGlucoseReading.date).toLocaleDateString()
                : 'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last BP Reading</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {latestBPSystolicReading?.value && latestBPDiastolicReading?.value
                      ? `${latestBPSystolicReading.value}/${latestBPDiastolicReading.value}`
                      : '--'} {latestBPSystolicReading?.unit || 'mmHg'}
                  </p>
                )}
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              {latestBPSystolicReading?.date
                ? new Date(latestBPSystolicReading.date).toLocaleDateString()
                : 'No data available'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              {upcomingAppointments.length > 0 ? 'Next: ' + upcomingAppointments[0].date : 'No appointments scheduled'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-purple-600">{todayMedications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              {todayMedications.filter(med => !med.taken).length} pending today
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {latestWeightReading ? `${latestWeightReading.value} kg` : '--'}
                </p>
              </div>
              <Weight className="h-8 w-8 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              {latestWeightReading?.date ? new Date(latestWeightReading.date).toLocaleDateString() : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Glucose Prediction */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Glucose Prediction</h3>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Predicted Fasting Glucose (Next Week)</p>
                <p className="text-3xl font-bold text-blue-600">{predictedGlucose} mg/dL</p>
                <p className="text-xs text-blue-600 mt-1">Based on current trends</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Current Average</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Math.round(glucoseReadings.filter(r => r.fastingGlucose).reduce((sum, reading) => sum + (reading.fastingGlucose || 0), 0) / glucoseReadings.filter(r => r.fastingGlucose).length) || 0} mg/dL
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Readings This Week</p>
                  <p className="text-xl font-semibold text-gray-900">{glucoseReadings.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Clock className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Glucose reading recorded</p>
                  <p className="text-xs text-gray-500">
                    {latestGlucoseReading?.fastingGlucose} mg/dL - {latestGlucoseReading?.date}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Pill className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Medication taken</p>
                  <p className="text-xs text-gray-500">Lisinopril 10mg - Today at 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                  <p className="text-xs text-gray-500">Dr. Anil Kumar - Jan 20, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link to="/appointments">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{appointment.doctorName}</p>
                    <p className="text-xs text-gray-500">
                      {appointment.date} at {appointment.time} - {appointment.specialty}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medication Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
              <Link to="/medications">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayMedications.slice(0, 3).map((medication) => (
                <div key={medication.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    medication.taken ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {medication.taken ? (
                      <Pill className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                    <p className="text-xs text-gray-500">
                      {medication.dosage} - {medication.timeOfDay.join(', ')}
                    </p>
                  </div>
                  <div className="text-xs">
                    {medication.taken ? (
                      <span className="text-green-600 font-medium">Taken</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Pending</span>
                    )}
                  </div>
                </div>
              ))}
              {todayMedications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No medications scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Glucose Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Glucose Reminders</h3>
              <Link to="/diabetes-care">
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayGlucoseReminders.slice(0, 3).map((reminder, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {reminder.type === 'fasting' && '🌅 Fasting Glucose Check'}
                      {reminder.type === 'post_meal' && '🍽️ Post-Meal Glucose Check'}
                      {reminder.type === 'random' && '🔄 Random Glucose Check'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scheduled for {reminder.time}
                    </p>
                  </div>
                  <div className="text-xs">
                    <span className="text-blue-600 font-medium">Reminder Set</span>
                  </div>
                </div>
              ))}
              {todayGlucoseReminders.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No glucose reminders set for today</p>
                  <Link to="/diabetes-care">
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminders
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Glucose Reading Modal */}
      <Modal
        isOpen={isGlucoseModalOpen}
        onClose={() => setIsGlucoseModalOpen(false)}
        title="Add Glucose Reading"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="glucose-value" className="block text-sm font-medium text-gray-700">
              Glucose Reading (mg/dL)
            </label>
            <input
              type="number"
              id="glucose-value"
              value={newGlucoseReading.value}
              onChange={(e) => setNewGlucoseReading({ ...newGlucoseReading, value: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 95"
              required
            />
          </div>
          <div>
            <label htmlFor="glucose-type" className="block text-sm font-medium text-gray-700">
              Reading Type
            </label>
            <select
              id="glucose-type"
              value={newGlucoseReading.type}
              onChange={(e) => setNewGlucoseReading({ ...newGlucoseReading, type: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="fasting">Fasting</option>
              <option value="random">Random</option>
              <option value="post_meal">Post-meal</option>
            </select>
          </div>
          <div>
            <label htmlFor="glucose-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="glucose-notes"
              value={newGlucoseReading.notes}
              onChange={(e) => setNewGlucoseReading({ ...newGlucoseReading, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsGlucoseModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGlucoseReading}
              disabled={isSubmitting || !newGlucoseReading.value}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Reading'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add BP Reading Modal */}
      <Modal
        isOpen={isBPModalOpen}
        onClose={() => setIsBPModalOpen(false)}
        title="Add Blood Pressure Reading"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bp-systolic" className="block text-sm font-medium text-gray-700">
                Systolic (mmHg)
              </label>
              <input
                type="number"
                id="bp-systolic"
                value={newBPReading.systolic}
                onChange={(e) => setNewBPReading({ ...newBPReading, systolic: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="e.g., 120"
                required
              />
            </div>
            <div>
              <label htmlFor="bp-diastolic" className="block text-sm font-medium text-gray-700">
                Diastolic (mmHg)
              </label>
              <input
                type="number"
                id="bp-diastolic"
                value={newBPReading.diastolic}
                onChange={(e) => setNewBPReading({ ...newBPReading, diastolic: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                placeholder="e.g., 80"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="bp-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="bp-notes"
              value={newBPReading.notes}
              onChange={(e) => setNewBPReading({ ...newBPReading, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsBPModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBPReading}
              disabled={isSubmitting || !newBPReading.systolic || !newBPReading.diastolic}
              variant="secondary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Reading'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Weight Modal */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Add Weight Reading"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="weight-value" className="block text-sm font-medium text-gray-700">
              Weight (kg) *
            </label>
            <input
              type="number"
              id="weight-value"
              value={newWeightReading.value}
              onChange={(e) => setNewWeightReading({ ...newWeightReading, value: e.target.value })}
              step="0.1"
              min="0"
              max="300"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              placeholder="Enter your current weight"
            />
          </div>
          <div>
            <label htmlFor="weight-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="weight-notes"
              value={newWeightReading.notes}
              onChange={(e) => setNewWeightReading({ ...newWeightReading, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsWeightModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWeightReading}
              disabled={isSubmitting || !newWeightReading.value}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Weight'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};