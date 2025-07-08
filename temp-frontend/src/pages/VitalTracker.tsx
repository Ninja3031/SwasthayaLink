import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Heart,
  Activity,
  Weight,
  Droplets,
  Moon,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { mockVitalReadings } from '../data/mockData';
import { VitalReading } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const VitalTracker: React.FC = () => {
  const [vitalReadings, setVitalReadings] = useLocalStorage<VitalReading[]>('vitalReadings', mockVitalReadings);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState<VitalReading['type']>('blood_pressure');
  const [vitalForm, setVitalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    systolic: '',
    diastolic: '',
    heartRate: '',
    weight: '',
    cholesterol: '',
    sleepHours: '',
    sleepQuality: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
    notes: '',
  });

  const resetForm = () => {
    setVitalForm({
      date: new Date().toISOString().split('T')[0],
      systolic: '',
      diastolic: '',
      heartRate: '',
      weight: '',
      cholesterol: '',
      sleepHours: '',
      sleepQuality: 'good',
      notes: '',
    });
  };

  const handleAddVital = () => {
    let value: any = {};
    
    switch (selectedVitalType) {
      case 'blood_pressure':
        if (vitalForm.systolic && vitalForm.diastolic) {
          value = { systolic: parseInt(vitalForm.systolic), diastolic: parseInt(vitalForm.diastolic) };
        }
        break;
      case 'heart_rate':
        if (vitalForm.heartRate) {
          value = { heartRate: parseInt(vitalForm.heartRate) };
        }
        break;
      case 'weight':
        if (vitalForm.weight) {
          value = { weight: parseFloat(vitalForm.weight) };
        }
        break;
      case 'cholesterol':
        if (vitalForm.cholesterol) {
          value = { cholesterol: parseInt(vitalForm.cholesterol) };
        }
        break;
      case 'sleep':
        if (vitalForm.sleepHours) {
          value = { sleepHours: parseFloat(vitalForm.sleepHours), sleepQuality: vitalForm.sleepQuality };
        }
        break;
    }

    if (Object.keys(value).length > 0) {
      const newReading: VitalReading = {
        id: Date.now().toString(),
        date: vitalForm.date,
        type: selectedVitalType,
        value,
        notes: vitalForm.notes,
      };
      setVitalReadings([newReading, ...vitalReadings]);
      setIsAddModalOpen(false);
      resetForm();
    }
  };

  const getLatestReading = (type: VitalReading['type']) => {
    return vitalReadings.find(r => r.type === type);
  };

  const getVitalIcon = (type: VitalReading['type']) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart className="h-8 w-8 text-red-500" />;
      case 'heart_rate':
        return <Activity className="h-8 w-8 text-pink-500" />;
      case 'weight':
        return <Weight className="h-8 w-8 text-blue-500" />;
      case 'cholesterol':
        return <Droplets className="h-8 w-8 text-yellow-500" />;
      case 'sleep':
        return <Moon className="h-8 w-8 text-purple-500" />;
      default:
        return <Activity className="h-8 w-8 text-gray-500" />;
    }
  };

  const getVitalValue = (reading: VitalReading) => {
    switch (reading.type) {
      case 'blood_pressure':
        return `${reading.value.systolic}/${reading.value.diastolic}`;
      case 'heart_rate':
        return `${reading.value.heartRate} bpm`;
      case 'weight':
        return `${reading.value.weight} kg`;
      case 'cholesterol':
        return `${reading.value.cholesterol} mg/dL`;
      case 'sleep':
        return `${reading.value.sleepHours}h`;
      default:
        return '--';
    }
  };

  const vitalTypes = [
    { type: 'blood_pressure' as const, name: 'Blood Pressure', color: 'red' },
    { type: 'heart_rate' as const, name: 'Heart Rate', color: 'pink' },
    { type: 'weight' as const, name: 'Weight', color: 'blue' },
    { type: 'cholesterol' as const, name: 'Cholesterol', color: 'yellow' },
    { type: 'sleep' as const, name: 'Sleep', color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vital Tracker</h1>
          <p className="text-gray-600">Monitor your vital signs and health metrics</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Add Vital
        </Button>
      </div>

      {/* Vital Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {vitalTypes.map((vital) => {
          const latestReading = getLatestReading(vital.type);
          return (
            <Card key={vital.type} className={`border-l-4 border-l-${vital.color}-500`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{vital.name}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {latestReading ? getVitalValue(latestReading) : '--'}
                    </p>
                    {latestReading && (
                      <p className="text-xs text-gray-500">
                        {new Date(latestReading.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {getVitalIcon(vital.type)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vital Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vitalTypes.map((vital) => {
          const readings = vitalReadings.filter(r => r.type === vital.type).slice(0, 7);
          return (
            <Card key={vital.type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{vital.name} Trend</h3>
                  <div className="flex items-center space-x-2">
                    {readings.length >= 2 && (
                      <div className="flex items-center text-sm">
                        {Math.random() > 0.5 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="text-gray-600">
                          {Math.random() > 0.5 ? 'Improving' : 'Declining'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    {getVitalIcon(vital.type)}
                    <p className="text-sm text-gray-600 mt-2">
                      {readings.length > 0 ? `${readings.length} readings` : 'No data yet'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Readings Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Readings</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vitalReadings.slice(0, 10).map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reading.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {reading.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getVitalValue(reading)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reading.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Vital Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Vital Reading"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="vital-type" className="block text-sm font-medium text-gray-700">
              Vital Type *
            </label>
            <select
              id="vital-type"
              value={selectedVitalType}
              onChange={(e) => setSelectedVitalType(e.target.value as VitalReading['type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {vitalTypes.map((vital) => (
                <option key={vital.type} value={vital.type}>
                  {vital.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="vital-date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="vital-date"
              value={vitalForm.date}
              onChange={(e) => setVitalForm({ ...vitalForm, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Dynamic form fields based on vital type */}
          {selectedVitalType === 'blood_pressure' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="systolic" className="block text-sm font-medium text-gray-700">
                  Systolic (mmHg) *
                </label>
                <input
                  type="number"
                  id="systolic"
                  value={vitalForm.systolic}
                  onChange={(e) => setVitalForm({ ...vitalForm, systolic: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>
              <div>
                <label htmlFor="diastolic" className="block text-sm font-medium text-gray-700">
                  Diastolic (mmHg) *
                </label>
                <input
                  type="number"
                  id="diastolic"
                  value={vitalForm.diastolic}
                  onChange={(e) => setVitalForm({ ...vitalForm, diastolic: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="80"
                />
              </div>
            </div>
          )}

          {selectedVitalType === 'heart_rate' && (
            <div>
              <label htmlFor="heart-rate" className="block text-sm font-medium text-gray-700">
                Heart Rate (bpm) *
              </label>
              <input
                type="number"
                id="heart-rate"
                value={vitalForm.heartRate}
                onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="72"
              />
            </div>
          )}

          {selectedVitalType === 'weight' && (
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                id="weight"
                value={vitalForm.weight}
                onChange={(e) => setVitalForm({ ...vitalForm, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="70.5"
              />
            </div>
          )}

          {selectedVitalType === 'cholesterol' && (
            <div>
              <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700">
                Cholesterol (mg/dL) *
              </label>
              <input
                type="number"
                id="cholesterol"
                value={vitalForm.cholesterol}
                onChange={(e) => setVitalForm({ ...vitalForm, cholesterol: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="180"
              />
            </div>
          )}

          {selectedVitalType === 'sleep' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sleep-hours" className="block text-sm font-medium text-gray-700">
                  Sleep Hours *
                </label>
                <input
                  type="number"
                  step="0.5"
                  id="sleep-hours"
                  value={vitalForm.sleepHours}
                  onChange={(e) => setVitalForm({ ...vitalForm, sleepHours: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="7.5"
                />
              </div>
              <div>
                <label htmlFor="sleep-quality" className="block text-sm font-medium text-gray-700">
                  Sleep Quality
                </label>
                <select
                  id="sleep-quality"
                  value={vitalForm.sleepQuality}
                  onChange={(e) => setVitalForm({ ...vitalForm, sleepQuality: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="vital-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="vital-notes"
              value={vitalForm.notes}
              onChange={(e) => setVitalForm({ ...vitalForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVital}>Add Reading</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};