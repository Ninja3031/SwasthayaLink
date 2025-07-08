import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Calendar,
  Clock,
  User,
  Building,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAppointments, type Appointment, type AppointmentForm } from '../hooks/useAppointments';

export const Appointments: React.FC = () => {
  const {
    appointments,
    isLoading,
    error,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    getAppointmentsByStatus
  } = useAppointments();

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    doctorName: '',
    date: '',
    time: '',
    type: 'consultation',
    hospital: '',
    specialty: '',
    notes: '',
  });

  const resetForm = () => {
    setAppointmentForm({
      doctorName: '',
      date: '',
      time: '',
      type: 'consultation',
      hospital: '',
      specialty: '',
      notes: '',
    });
  };

  const handleBookAppointment = async () => {
    if (!appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time) return;

    setIsSubmitting(true);
    setSuccess('');

    try {
      await bookAppointment(appointmentForm);
      setSuccess('Appointment booked successfully!');
      setIsBookModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Failed to book appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await cancelAppointment(id);
      setSuccess('Appointment cancelled successfully!');
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  // Get filtered appointments
  const upcomingAppointments = getUpcomingAppointments();
  const scheduledAppointments = getAppointmentsByStatus('scheduled');
  const completedAppointments = getAppointmentsByStatus('completed');
  const cancelledAppointments = getAppointmentsByStatus('cancelled');

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    setSuccess('');

    try {
      await updateAppointment(selectedAppointment.id, appointmentForm);
      setSuccess('Appointment updated successfully!');
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
      resetForm();
    } catch (err) {
      console.error('Failed to update appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      hospital: appointment.hospital,
      specialty: appointment.specialty,
      notes: appointment.notes || '',
    });
    setIsEditModalOpen(true);
  };



  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-purple-100 text-purple-800';
      case 'follow_up':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your medical appointments</p>
        </div>
        <Button
          onClick={() => setIsBookModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
          disabled={isLoading}
        >
          Book Appointment
        </Button>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{cancelledAppointments.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                        {appointment.hospital && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-1" />
                            {appointment.hospital}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Edit}
                        onClick={() => handleEditClick(appointment)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {upcomingAppointments.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming appointments scheduled</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments</h2>
        <div className="space-y-4">
          {completedAppointments.slice(0, 5).map((appointment: Appointment) => (
            <Card key={appointment.id} className="opacity-75">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {completedAppointments.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No past appointments found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book New Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="doctor-name" className="block text-sm font-medium text-gray-700">
              Doctor Name *
            </label>
            <input
              type="text"
              id="doctor-name"
              value={appointmentForm.doctorName}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter doctor name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="appointment-date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="appointment-time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                id="appointment-time"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="appointment-type" className="block text-sm font-medium text-gray-700">
              Appointment Type
            </label>
            <select
              id="appointment-type"
              value={appointmentForm.type}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value as Appointment['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="checkup">Routine Checkup</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                Hospital/Clinic
              </label>
              <input
                type="text"
                id="hospital"
                value={appointmentForm.hospital}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, hospital: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <input
                type="text"
                id="specialty"
                value={appointmentForm.specialty}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, specialty: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Cardiology"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsBookModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={isSubmitting || !appointmentForm.doctorName || !appointmentForm.date || !appointmentForm.time}
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-doctor-name" className="block text-sm font-medium text-gray-700">
              Doctor Name *
            </label>
            <input
              type="text"
              id="edit-doctor-name"
              value={appointmentForm.doctorName}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter doctor name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-appointment-date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="edit-appointment-date"
                value={appointmentForm.date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="edit-appointment-time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                type="time"
                id="edit-appointment-time"
                value={appointmentForm.time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-appointment-type" className="block text-sm font-medium text-gray-700">
              Appointment Type
            </label>
            <select
              id="edit-appointment-type"
              value={appointmentForm.type}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value as Appointment['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="checkup">Routine Checkup</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-hospital" className="block text-sm font-medium text-gray-700">
                Hospital/Clinic
              </label>
              <input
                type="text"
                id="edit-hospital"
                value={appointmentForm.hospital}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, hospital: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <label htmlFor="edit-specialty" className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <input
                type="text"
                id="edit-specialty"
                value={appointmentForm.specialty}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, specialty: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Cardiology"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="edit-notes"
              value={appointmentForm.notes}
              onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditAppointment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Appointment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};