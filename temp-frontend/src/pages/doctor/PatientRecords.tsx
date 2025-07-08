import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import {
  Users,
  Search,
  Eye,
  Plus,
  Calendar,
  FileText,
  Activity,
  Heart,
  Pill,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { mockPatientRecords, mockGlucoseReadings, mockVitalReadings } from '../../data/mockData';
import { PatientRecord, GlucoseReading, VitalReading } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const PatientRecords: React.FC = () => {
  const [patientRecords] = useLocalStorage<PatientRecord[]>('patientRecords', mockPatientRecords);
  const [glucoseReadings] = useLocalStorage<GlucoseReading[]>('glucoseReadings', mockGlucoseReadings);
  const [vitalReadings] = useLocalStorage<VitalReading[]>('vitalReadings', mockVitalReadings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({
    patientId: '',
    chiefComplaint: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpDate: '',
  });

  const handleViewPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    setIsPatientModalOpen(true);
  };

  const handleAddRecord = () => {
    if (newRecordForm.patientId && newRecordForm.chiefComplaint) {
      const newRecord: PatientRecord = {
        id: Date.now().toString(),
        patientId: newRecordForm.patientId,
        doctorId: 'doc1',
        visitDate: new Date().toISOString().split('T')[0],
        chiefComplaint: newRecordForm.chiefComplaint,
        symptoms: newRecordForm.symptoms.split(',').map(s => s.trim()),
        diagnosis: newRecordForm.diagnosis,
        treatment: newRecordForm.treatment,
        notes: newRecordForm.notes,
        followUpDate: newRecordForm.followUpDate || undefined,
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          weight: 70,
          height: 170,
        },
      };
      
      console.log('New record added:', newRecord);
      setIsAddRecordModalOpen(false);
      setNewRecordForm({
        patientId: '',
        chiefComplaint: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        followUpDate: '',
      });
    }
  };

  const filteredRecords = patientRecords.filter(record =>
    record.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatientGlucoseData = (patientId: string) => {
    return glucoseReadings.filter(reading => reading.patientId === patientId);
  };

  const getPatientVitalData = (patientId: string) => {
    return vitalReadings.filter(reading => reading.patientId === patientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600">Access and manage patient health records</p>
        </div>
        <Button
          onClick={() => setIsAddRecordModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Add Record
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Patient ID, ABHA ID, complaint, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
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
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-600">{patientRecords.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">
                  {patientRecords.filter(r => {
                    const recordDate = new Date(r.visitDate);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return recordDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow-ups Due</p>
                <p className="text-2xl font-bold text-orange-600">
                  {patientRecords.filter(r => r.followUpDate && new Date(r.followUpDate) <= new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Diagnosis</p>
                <p className="text-2xl font-bold text-purple-600">
                  {patientRecords.filter(r => !r.diagnosis).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Records List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chief Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow-up
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.patientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.chiefComplaint}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.diagnosis || (
                        <span className="text-yellow-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.followUpDate 
                        ? new Date(record.followUpDate).toLocaleDateString()
                        : '--'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => handleViewPatient(record.patientId)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title={`Patient Records - ${selectedPatient}`}
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Timeline */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Medical History Timeline</h4>
              <div className="space-y-4">
                {patientRecords
                  .filter(r => r.patientId === selectedPatient)
                  .map((record) => (
                    <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-gray-900">{record.chiefComplaint}</h5>
                        <span className="text-sm text-gray-500">
                          {new Date(record.visitDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Diagnosis:</span> {record.diagnosis || 'Pending'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Treatment:</span> {record.treatment}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Glucose Readings */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Glucose Readings
                </h4>
                <div className="space-y-2">
                  {getPatientGlucoseData(selectedPatient).slice(0, 5).map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {reading.fastingGlucose && `Fasting: ${reading.fastingGlucose} mg/dL`}
                          {reading.postMealGlucose && ` | Post-meal: ${reading.postMealGlucose} mg/dL`}
                        </p>
                        <p className="text-xs text-gray-500">{reading.notes}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(reading.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vital Signs */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Vital Signs
                </h4>
                <div className="space-y-2">
                  {getPatientVitalData(selectedPatient).slice(0, 5).map((reading) => (
                    <div key={reading.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {reading.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {reading.type === 'blood_pressure' && 
                            `${reading.value.systolic}/${reading.value.diastolic} mmHg`}
                          {reading.type === 'heart_rate' && `${reading.value.heartRate} bpm`}
                          {reading.type === 'weight' && `${reading.value.weight} kg`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(reading.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" icon={Pill}>
                Prescribe Medication
              </Button>
              <Button icon={Plus}>
                Add Clinical Note
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Record Modal */}
      <Modal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        title="Add Patient Record"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient ID / ABHA ID *</label>
            <input
              type="text"
              value={newRecordForm.patientId}
              onChange={(e) => setNewRecordForm({ ...newRecordForm, patientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter patient ID or ABHA ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chief Complaint *</label>
            <input
              type="text"
              value={newRecordForm.chiefComplaint}
              onChange={(e) => setNewRecordForm({ ...newRecordForm, chiefComplaint: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Primary reason for visit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Symptoms</label>
            <input
              type="text"
              value={newRecordForm.symptoms}
              onChange={(e) => setNewRecordForm({ ...newRecordForm, symptoms: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Comma-separated list of symptoms"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <input
                type="text"
                value={newRecordForm.diagnosis}
                onChange={(e) => setNewRecordForm({ ...newRecordForm, diagnosis: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Clinical diagnosis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
              <input
                type="date"
                value={newRecordForm.followUpDate}
                onChange={(e) => setNewRecordForm({ ...newRecordForm, followUpDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
            <textarea
              value={newRecordForm.treatment}
              onChange={(e) => setNewRecordForm({ ...newRecordForm, treatment: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Treatment recommendations and medications"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Clinical Notes</label>
            <textarea
              value={newRecordForm.notes}
              onChange={(e) => setNewRecordForm({ ...newRecordForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional clinical observations and notes"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecord}>Add Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};