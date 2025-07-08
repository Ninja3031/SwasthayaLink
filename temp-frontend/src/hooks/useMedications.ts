import { useState, useEffect } from 'react';
import { medicationService, Medication } from '../services/medicationService';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await medicationService.getMedications();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medications');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'taken' | 'isActive'>) => {
    try {
      const newMedication = await medicationService.addMedication(medicationData);
      setMedications(prev => [newMedication, ...prev]);
      return newMedication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add medication');
      throw err;
    }
  };

  const updateMedication = async (id: string, medicationData: Partial<Medication>) => {
    try {
      const updatedMedication = await medicationService.updateMedication(id, medicationData);
      setMedications(prev => prev.map(med => med.id === id ? updatedMedication : med));
      return updatedMedication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medication');
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await medicationService.deleteMedication(id);
      setMedications(prev => prev.filter(med => med.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medication');
      throw err;
    }
  };

  const markMedicationTaken = async (id: string) => {
    try {
      const updatedMedication = await medicationService.markMedicationTaken(id);
      setMedications(prev => prev.map(med => med.id === id ? updatedMedication : med));
      return updatedMedication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark medication as taken');
      throw err;
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return {
    medications,
    isLoading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    markMedicationTaken,
    refetch: fetchMedications,
  };
};
