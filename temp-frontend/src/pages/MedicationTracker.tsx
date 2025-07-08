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
} from 'lucide-react';
import { mockMedications } from '../data/mockData';
import { Medication } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const MedicationTracker: React.FC = () => {
  const [medications, setMedications] = useLocalStorage<Medication[]>('medications', mockMedications);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    timeOfDay: [''],
    instructions: '',
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
      };
      setMedications([...medications, newMedication]);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const handleEditMedication = () => {
    if (selectedMedication) {
      const updatedMedications = medications.map(med =>
        med.id === selectedMedication.id
          ? {
              ...med,
              name: medicationForm.name,
              dosage: medicationForm.dosage,
              frequency: medicationForm.frequency,
              startDate: medicationForm.startDate,
              endDate: medicationForm.endDate,
              timeOfDay: medicationForm.timeOfDay.filter(time => time !== ''),
              instructions: medicationForm.instructions,
            }
          : med
      );
      setMedications(updatedMedications);
      setIsEditModalOpen(false);
      setSelectedMedication(null);
      resetForm();
    }
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleMarkAsTaken = (id: string) => {
    const updatedMedications = medications.map(med =>
      med.id === id
        ? { ...med, taken: true, lastTaken: new Date().toISOString() }
        : med
    );
    setMedications(updatedMedications);
  };

  const openEditModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setMedicationForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate,
      endDate: medication.endDate,
      timeOfDay: medication.timeOfDay.length > 0 ? medication.timeOfDay : [''],
      instructions: medication.instructions || '',
    });
    setIsEditModalOpen(true);
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

  const activeMedications = medications.filter(med => {
    const today = new Date();
    const endDate = new Date(med.endDate);
    return endDate >= today;
  });

  const completedMedications = medications.filter(med => {
    const today = new Date();
    const endDate = new Date(med.endDate);
    return endDate < today;
  });

  const pendingToday = activeMedications.filter(med => !med.taken).length;
  const takenToday = activeMedications.filter(med => med.taken).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Tracker</h1>
          <p className="text-gray-600">Manage your medications and dosage schedule</p>
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

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taken Today</p>
                <p className="text-2xl font-bold text-green-600">{takenToday}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Today</p>
                <p className="text-2xl font-bold text-orange-600">{pendingToday}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Courses</p>
                <p className="text-2xl font-bold text-purple-600">{completedMedications.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Medications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Medications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMedications.map((medication) => (
            <Card key={medication.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      medication.taken ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {medication.taken ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Pill className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      <p className="text-sm text-gray-600">{medication.dosage}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Edit}
                      onClick={() => openEditModal(medication)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => handleDeleteMedication(medication.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Frequency</p>
                    <p className="text-sm text-gray-900">{medication.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Time of Day</p>
                    <div className="flex flex-wrap gap-1">
                      {medication.timeOfDay.map((time, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Until: {new Date(medication.endDate).toLocaleDateString()}
                    </span>
                    {medication.taken ? (
                      <span className="text-green-600 font-medium">Taken</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Pending</span>
                    )}
                  </div>
                  {medication.instructions && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-700">{medication.instructions}</p>
                    </div>
                  )}
                  {!medication.taken && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsTaken(medication.id)}
                      className="w-full"
                      variant="secondary"
                    >
                      Mark as Taken
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Medications */}
      {completedMedications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMedications.map((medication) => (
              <Card key={medication.id} className="opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="text-gray-900">{new Date(medication.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">
                        {Math.ceil((new Date(medication.endDate).getTime() - new Date(medication.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
              <label htmlFor="med-name" className="block text-sm font-medium text-gray-700">
                Medication Name *
              </label>
              <input
                type="text"
                id="med-name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Metformin"
              />
            </div>
            <div>
              <label htmlFor="med-dosage" className="block text-sm font-medium text-gray-700">
                Dosage *
              </label>
              <input
                type="text"
                id="med-dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 500mg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-frequency" className="block text-sm font-medium text-gray-700">
              Frequency *
            </label>
            <select
              id="med-frequency"
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
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                id="start-date"
                value={medicationForm.startDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                id="end-date"
                value={medicationForm.endDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
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
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              id="instructions"
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

      {/* Edit Medication Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Medication"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-med-name" className="block text-sm font-medium text-gray-700">
                Medication Name *
              </label>
              <input
                type="text"
                id="edit-med-name"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Metformin"
              />
            </div>
            <div>
              <label htmlFor="edit-med-dosage" className="block text-sm font-medium text-gray-700">
                Dosage *
              </label>
              <input
                type="text"
                id="edit-med-dosage"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 500mg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-med-frequency" className="block text-sm font-medium text-gray-700">
              Frequency *
            </label>
            <select
              id="edit-med-frequency"
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
              <label htmlFor="edit-start-date" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                id="edit-start-date"
                value={medicationForm.startDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="edit-end-date" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                id="edit-end-date"
                value={medicationForm.endDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
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
            <label htmlFor="edit-instructions" className="block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              id="edit-instructions"
              value={medicationForm.instructions}
              onChange={(e) => setMedicationForm({ ...medicationForm, instructions: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Take with food"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMedication}>Update Medication</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};