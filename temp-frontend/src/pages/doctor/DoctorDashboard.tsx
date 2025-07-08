import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import {
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { mockDoctorAppointments, mockPatientRecords, mockDoctorUser } from '../../data/mockData';
import { Appointment, PatientRecord } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const DoctorDashboard: React.FC = () => {
  const [appointments] = useLocalStorage<Appointment[]>('doctorAppointments', mockDoctorAppointments);
  const [patientRecords] = useLocalStorage<PatientRecord[]>('patientRecords', mockPatientRecords);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const [quickNoteForm, setQuickNoteForm] = useState({
    patientId: '',
    notes: '',
    followUpRequired: false,
  });

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate > today && apt.status === 'scheduled';
  });

  const completedToday = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today && apt.status === 'completed';
  }).length;

  const pendingReports = patientRecords.filter(record => !record.diagnosis).length;

  const handleAddQuickNote = () => {
    if (quickNoteForm.patientId && quickNoteForm.notes) {
      // In a real app, this would save to the backend
      console.log('Quick note added:', quickNoteForm);
      setIsQuickNoteModalOpen(false);
      setQuickNoteForm({
        patientId: '',
        notes: '',
        followUpRequired: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {mockDoctorUser.name}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsQuickNoteModalOpen(true)}
            icon={Plus}
            variant="outline"
          >
            Quick Note
          </Button>
          <Button icon={ClipboardList} className="shadow-lg">
            New Prescription
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Patients</p>
                <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{completedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-red-600">{pendingReports}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{appointment.time}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Records
                    </Button>
                    {appointment.status !== 'completed' && (
                      <Button size="sm">
                        Start Consultation
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                icon={Users}
                className="w-full justify-start"
                variant="outline"
              >
                Search Patient Records
              </Button>
              <Button
                icon={ClipboardList}
                className="w-full justify-start"
                variant="outline"
              >
                Write Prescription
              </Button>
              <Button
                icon={FileText}
                className="w-full justify-start"
                variant="outline"
              >
                Clinical Notes
              </Button>
              <Button
                icon={Calendar}
                className="w-full justify-start"
                variant="outline"
              >
                Schedule Appointment
              </Button>
              <Button
                icon={TrendingUp}
                className="w-full justify-start"
                variant="outline"
              >
                Patient Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Patient Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Patient Consultation</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{record.chiefComplaint}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Diagnosis: {record.diagnosis || 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Note Modal */}
      <Modal
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        title="Add Quick Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient ID</label>
            <input
              type="text"
              value={quickNoteForm.patientId}
              onChange={(e) => setQuickNoteForm({ ...quickNoteForm, patientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter patient ID or ABHA ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
            <textarea
              value={quickNoteForm.notes}
              onChange={(e) => setQuickNoteForm({ ...quickNoteForm, notes: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter clinical observations, recommendations, or notes..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="follow-up"
              checked={quickNoteForm.followUpRequired}
              onChange={(e) => setQuickNoteForm({ ...quickNoteForm, followUpRequired: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="follow-up" className="ml-2 text-sm text-gray-700">
              Follow-up required
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsQuickNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddQuickNote}>Add Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};