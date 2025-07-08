import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Phone,
  Video,
  MapPin,
  Search,
} from 'lucide-react';
import { mockDoctorAppointments } from '../../data/mockData';
import { Appointment } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('doctorAppointments', mockDoctorAppointments);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    patientId: '',
    date: '',
    time: '',
    type: 'consultation' as Appointment['type'],
    symptoms: '',
    consultationMode: 'in-person' as 'in-person' | 'video' | 'phone',
  });

  const handleScheduleAppointment = () => {
    if (appointmentForm.patientName && appointmentForm.date && appointmentForm.time) {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        doctorName: 'Dr. Anil Kumar',
        doctorId: 'doc1',
        patientName: appointmentForm.patientName,
        patientId: appointmentForm.patientId,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        status: 'scheduled',
        symptoms: appointmentForm.symptoms,
        consultationFee: 800,
        estimatedDuration: 30,
      };
      setAppointments([...appointments, newAppointment]);
      setIsScheduleModalOpen(false);
      setAppointmentForm({
        patientName: '',
        patientId: '',
        date: '',
        time: '',
        type: 'consultation',
        symptoms: '',
        consultationMode: 'in-person',
      });
    }
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    );
    setAppointments(updatedAppointments);
  };

  const openDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.symptoms?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayAppointments = filteredAppointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate > today;
  });

  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'follow-up':
        return 'bg-green-100 text-green-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'routine':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments & Scheduling</h1>
          <p className="text-gray-600">Manage patient appointments and consultation schedule</p>
        </div>
        <Button
          onClick={() => setIsScheduleModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Schedule Appointment
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-orange-600">{appointments.length}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                    <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{appointment.time}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetailsModal(appointment)}
                  >
                    View Details
                  </Button>
                  {appointment.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                    >
                      Complete
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

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
                    <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetailsModal(appointment)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule New Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
              <input
                type="text"
                value={appointmentForm.patientName}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient ID / ABHA ID</label>
              <input
                type="text"
                value={appointmentForm.patientId}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter patient ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time *</label>
              <input
                type="time"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
              <select
                value={appointmentForm.type}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value as Appointment['type'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="routine">Routine Checkup</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Mode</label>
              <select
                value={appointmentForm.consultationMode}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, consultationMode: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="in-person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Symptoms / Reason</label>
            <textarea
              value={appointmentForm.symptoms}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, symptoms: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter symptoms or reason for visit..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleAppointment}>Schedule Appointment</Button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Patient Name</p>
                <p className="text-sm text-gray-900">{selectedAppointment.patientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Patient ID</p>
                <p className="text-sm text-gray-900">{selectedAppointment.patientId || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedAppointment.type)}`}>
                  {selectedAppointment.type}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                <p className="text-sm text-gray-900">₹{selectedAppointment.consultationFee}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Symptoms / Reason</p>
              <p className="text-sm text-gray-900 mt-1">{selectedAppointment.symptoms}</p>
            </div>

            {selectedAppointment.diagnosis && (
              <div>
                <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                <p className="text-sm text-gray-900 mt-1">{selectedAppointment.diagnosis}</p>
              </div>
            )}

            {selectedAppointment.prescription && (
              <div>
                <p className="text-sm font-medium text-gray-700">Prescription</p>
                <p className="text-sm text-gray-900 mt-1">{selectedAppointment.prescription}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
              {selectedAppointment.status === 'scheduled' && (
                <Button onClick={() => {
                  handleUpdateStatus(selectedAppointment.id, 'confirmed');
                  setIsDetailsModalOpen(false);
                }}>
                  Confirm Appointment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};