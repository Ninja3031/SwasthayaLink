import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  Send,
  Pill,
  User,
  Calendar,
  Trash2,
  Edit,
} from 'lucide-react';
import { Prescription, PrescribedMedication } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const DoctorPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useLocalStorage<Prescription[]>('prescriptions', []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    patientName: '',
    diagnosis: '',
    notes: '',
    medications: [] as PrescribedMedication[],
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: '',
    refills: '',
  });

  const handleAddMedication = () => {
    if (medicationForm.name && medicationForm.dosage && medicationForm.frequency) {
      const newMedication: PrescribedMedication = {
        id: Date.now().toString(),
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        duration: medicationForm.duration,
        instructions: medicationForm.instructions,
        quantity: parseInt(medicationForm.quantity) || 30,
        refills: parseInt(medicationForm.refills) || 0,
      };
      
      setPrescriptionForm({
        ...prescriptionForm,
        medications: [...prescriptionForm.medications, newMedication],
      });
      
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: '',
        refills: '',
      });
    }
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: prescriptionForm.medications.filter(med => med.id !== id),
    });
  };

  const handleCreatePrescription = () => {
    if (prescriptionForm.patientId && prescriptionForm.diagnosis && prescriptionForm.medications.length > 0) {
      const newPrescription: Prescription = {
        id: Date.now().toString(),
        patientId: prescriptionForm.patientId,
        doctorId: 'doc1',
        date: new Date().toISOString().split('T')[0],
        medications: prescriptionForm.medications,
        diagnosis: prescriptionForm.diagnosis,
        notes: prescriptionForm.notes,
        status: 'active',
        fulfillmentStatus: 'pending',
      };
      
      setPrescriptions([newPrescription, ...prescriptions]);
      setIsCreateModalOpen(false);
      setPrescriptionForm({
        patientId: '',
        patientName: '',
        diagnosis: '',
        notes: '',
        medications: [],
      });
    }
  };

  const handleSendToPharmacy = (prescriptionId: string) => {
    const updatedPrescriptions = prescriptions.map(prescription =>
      prescription.id === prescriptionId
        ? { ...prescription, fulfillmentStatus: 'processing' as const }
        : prescription
    );
    setPrescriptions(updatedPrescriptions);
  };

  const openViewModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewModalOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prescription.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const pendingFulfillment = prescriptions.filter(p => p.fulfillmentStatus === 'pending').length;
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFulfillmentColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
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
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions & Pharmacy</h1>
          <p className="text-gray-600">Create and manage digital prescriptions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Create Prescription
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient ID or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">{activePrescriptions}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Fulfillment</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingFulfillment}</p>
              </div>
              <Pill className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedPrescriptions}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-purple-600">{prescriptions.length}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Patient ID: {prescription.patientId}</h4>
                    <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {prescription.medications.length} medications
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                    {prescription.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFulfillmentColor(prescription.fulfillmentStatus || 'pending')}`}>
                    {prescription.fulfillmentStatus || 'pending'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => openViewModal(prescription)}
                  >
                    View
                  </Button>
                  {prescription.fulfillmentStatus === 'pending' && (
                    <Button
                      size="sm"
                      icon={Send}
                      onClick={() => handleSendToPharmacy(prescription.id)}
                    >
                      Send to Pharmacy
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {filteredPrescriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No prescriptions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Prescription Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Prescription"
        size="xl"
      >
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient ID / ABHA ID *</label>
              <input
                type="text"
                value={prescriptionForm.patientId}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter patient ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name</label>
              <input
                type="text"
                value={prescriptionForm.patientName}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter patient name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis *</label>
            <input
              type="text"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter diagnosis"
            />
          </div>

          {/* Add Medication Section */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Medications</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Medication Name *</label>
                <input
                  type="text"
                  value={medicationForm.name}
                  onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="e.g., Metformin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage *</label>
                <input
                  type="text"
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency *</label>
                <select
                  value={medicationForm.frequency}
                  onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input
                  type="text"
                  value={medicationForm.duration}
                  onChange={(e) => setMedicationForm({ ...medicationForm, duration: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="e.g., 30 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={medicationForm.quantity}
                  onChange={(e) => setMedicationForm({ ...medicationForm, quantity: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Refills</label>
                <input
                  type="number"
                  value={medicationForm.refills}
                  onChange={(e) => setMedicationForm({ ...medicationForm, refills: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="2"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                value={medicationForm.instructions}
                onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="e.g., Take with food"
              />
            </div>
            <Button onClick={handleAddMedication} icon={Plus} size="sm">
              Add Medication
            </Button>
          </div>

          {/* Added Medications List */}
          {prescriptionForm.medications.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Added Medications</h4>
              <div className="space-y-2">
                {prescriptionForm.medications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{medication.name} - {medication.dosage}</p>
                      <p className="text-sm text-gray-600">
                        {medication.frequency} • {medication.duration} • Qty: {medication.quantity}
                      </p>
                      {medication.instructions && (
                        <p className="text-xs text-gray-500">{medication.instructions}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handleRemoveMedication(medication.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Any additional notes or instructions..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePrescription}>Create Prescription</Button>
          </div>
        </div>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Patient ID</p>
                <p className="text-sm text-gray-900">{selectedPrescription.patientId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedPrescription.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                  {selectedPrescription.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Fulfillment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFulfillmentColor(selectedPrescription.fulfillmentStatus || 'pending')}`}>
                  {selectedPrescription.fulfillmentStatus || 'pending'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Diagnosis</p>
              <p className="text-sm text-gray-900 mt-1">{selectedPrescription.diagnosis}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Medications</p>
              <div className="space-y-3">
                {selectedPrescription.medications.map((medication) => (
                  <div key={medication.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{medication.name}</h4>
                      <span className="text-sm text-gray-600">{medication.dosage}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Frequency: {medication.frequency}</p>
                      <p>Duration: {medication.duration}</p>
                      <p>Quantity: {medication.quantity} • Refills: {medication.refills}</p>
                      {medication.instructions && (
                        <p className="mt-1 text-xs text-gray-500">Instructions: {medication.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPrescription.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700">Additional Notes</p>
                <p className="text-sm text-gray-900 mt-1">{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {selectedPrescription.fulfillmentStatus === 'pending' && (
                <Button onClick={() => {
                  handleSendToPharmacy(selectedPrescription.id);
                  setIsViewModalOpen(false);
                }}>
                  Send to Pharmacy
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};