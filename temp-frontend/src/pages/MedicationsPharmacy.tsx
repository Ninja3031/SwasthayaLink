import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Pill,
  Plus,
  Edit,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Calendar,
  Truck,
  MapPin,
  Phone,
  Star,
} from 'lucide-react';
import { mockMedications, mockPharmacies } from '../data/mockData';
import { Medication, Pharmacy } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const MedicationsPharmacy: React.FC = () => {
  const [medications, setMedications] = useLocalStorage<Medication[]>('medications', mockMedications);
  const [pharmacies] = useLocalStorage<Pharmacy[]>('pharmacies', mockPharmacies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    timeOfDay: [''],
    instructions: '',
    prescribedBy: '',
  });

  const resetForm = () => {
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      timeOfDay: [''],
      instructions: '',
      prescribedBy: '',
    });
  };

  const handleAddMedication = () => {
    if (medicationForm.name && medicationForm.dosage && medicationForm.frequency) {
      const newMedication: Medication = {
        id: Date.now().toString(),
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        startDate: medicationForm.startDate,
        endDate: medicationForm.endDate,
        timeOfDay: medicationForm.timeOfDay.filter(time => time !== ''),
        instructions: medicationForm.instructions,
        taken: false,
        prescribedBy: medicationForm.prescribedBy,
        pharmacyStatus: 'pending',
        refillsRemaining: 3,
      };
      setMedications([...medications, newMedication]);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleMarkAsTaken = (id: string) => {
    const updatedMedications = medications.map(med =>
      med.id === id
        ? { ...med, taken: true, lastTaken: new Date().toISOString() }
        : med
    );
    setMedications(updatedMedications);
  };

  const handleRequestRefill = () => {
    if (selectedMedication && selectedPharmacy) {
      const updatedMedications = medications.map(med =>
        med.id === selectedMedication.id
          ? { ...med, pharmacyStatus: 'processing' as const }
          : med
      );
      setMedications(updatedMedications);
      setIsRefillModalOpen(false);
      setSelectedMedication(null);
      setSelectedPharmacy(null);
    }
  };

  const openRefillModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsRefillModalOpen(true);
  };

  const addTimeSlot = () => {
    setMedicationForm({
      ...medicationForm,
      timeOfDay: [...medicationForm.timeOfDay, ''],
    });
  };

  const removeTimeSlot = (index: number) => {
    setMedicationForm({
      ...medicationForm,
      timeOfDay: medicationForm.timeOfDay.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updatedTimes = [...medicationForm.timeOfDay];
    updatedTimes[index] = value;
    setMedicationForm({
      ...medicationForm,
      timeOfDay: updatedTimes,
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      case 'ready':
        return <Check className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const activeMedications = medications.filter(med => {
    const today = new Date();
    const endDate = new Date(med.endDate);
    return endDate >= today;
  });

  const pendingRefills = medications.filter(med => med.refillsRemaining === 0 || med.pharmacyStatus === 'pending').length;
  const readyForPickup = medications.filter(med => med.pharmacyStatus === 'ready').length;
  const takenToday = activeMedications.filter(med => med.taken).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications & Pharmacy</h1>
          <p className="text-gray-600">Manage medications, refills, and pharmacy integration</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Add Medication
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-blue-600">{activeMedications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Refills</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRefills}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready for Pickup</p>
                <p className="text-2xl font-bold text-green-600">{readyForPickup}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taken Today</p>
                <p className="text-2xl font-bold text-purple-600">{takenToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMedications.map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          medication.taken ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {medication.taken ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Pill className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
                          <p className="text-xs text-gray-500">Prescribed by: {medication.prescribedBy}</p>
                          
                          {/* Pharmacy Status */}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(medication.pharmacyStatus || 'pending')}`}>
                              {getStatusIcon(medication.pharmacyStatus || 'pending')}
                              <span className="ml-1 capitalize">{medication.pharmacyStatus || 'pending'}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              {medication.refillsRemaining} refills remaining
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {!medication.taken && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsTaken(medication.id)}
                            variant="secondary"
                          >
                            Mark Taken
                          </Button>
                        )}
                        {(medication.refillsRemaining === 0 || medication.pharmacyStatus === 'pending') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRefillModal(medication)}
                          >
                            Request Refill
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pharmacy Integration */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Partner Pharmacies</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{pharmacy.rating}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {pharmacy.address}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {pharmacy.phone}
                          </div>
                          {pharmacy.deliveryAvailable && (
                            <div className="flex items-center text-xs text-green-600">
                              <Truck className="h-3 w-3 mr-1" />
                              Delivery in {pharmacy.estimatedDeliveryTime} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${pharmacy.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medication"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Medication Name *</label>
              <input
                type="text"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Metformin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dosage *</label>
              <input
                type="text"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 500mg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency *</label>
            <select
              value={medicationForm.frequency}
              onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                value={medicationForm.startDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <input
                type="date"
                value={medicationForm.endDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prescribed By</label>
            <input
              type="text"
              value={medicationForm.prescribedBy}
              onChange={(e) => setMedicationForm({ ...medicationForm, prescribedBy: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Dr. Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time of Day</label>
            <div className="space-y-2">
              {medicationForm.timeOfDay.map((time, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {medicationForm.timeOfDay.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Trash2}
                      onClick={() => removeTimeSlot(index)}
                    />
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={addTimeSlot}
              >
                Add Time
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              value={medicationForm.instructions}
              onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Take with food"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMedication}>Add Medication</Button>
          </div>
        </div>
      </Modal>

      {/* Refill Request Modal */}
      <Modal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        title="Request Medication Refill"
        size="lg"
      >
        {selectedMedication && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800">Medication Details</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p><span className="font-medium">Name:</span> {selectedMedication.name}</p>
                <p><span className="font-medium">Dosage:</span> {selectedMedication.dosage}</p>
                <p><span className="font-medium">Frequency:</span> {selectedMedication.frequency}</p>
                <p><span className="font-medium">Refills Remaining:</span> {selectedMedication.refillsRemaining}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Pharmacy</label>
              <div className="space-y-3">
                {pharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPharmacy?.id === pharmacy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-600">{pharmacy.address}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {pharmacy.rating}
                          </div>
                          {pharmacy.deliveryAvailable && (
                            <div className="flex items-center text-xs text-green-600">
                              <Truck className="h-3 w-3 mr-1" />
                              Delivery available
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${pharmacy.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsRefillModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestRefill}
                disabled={!selectedPharmacy}
              >
                Request Refill
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};