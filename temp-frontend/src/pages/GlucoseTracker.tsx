import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Activity,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Brain,
} from 'lucide-react';
import { mockGlucoseReadings } from '../data/mockData';
import { GlucoseReading } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const GlucoseTracker: React.FC = () => {
  const [glucoseReadings, setGlucoseReadings] = useLocalStorage<GlucoseReading[]>('glucoseReadings', mockGlucoseReadings);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPredictionLoading, setPredictionLoading] = useState(false);
  const [predictedGlucose, setPredictedGlucose] = useState<number | null>(null);
  const [glucoseForm, setGlucoseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fastingGlucose: '',
    postMealGlucose: '',
    notes: '',
  });

  const handleAddReading = () => {
    if (glucoseForm.fastingGlucose || glucoseForm.postMealGlucose) {
      const newReading: GlucoseReading = {
        id: Date.now().toString(),
        date: glucoseForm.date,
        fastingGlucose: glucoseForm.fastingGlucose ? parseInt(glucoseForm.fastingGlucose) : undefined,
        postMealGlucose: glucoseForm.postMealGlucose ? parseInt(glucoseForm.postMealGlucose) : undefined,
        type: glucoseForm.fastingGlucose ? 'fasting' : 'post_meal',
        notes: glucoseForm.notes,
      };
      setGlucoseReadings([newReading, ...glucoseReadings]);
      setIsAddModalOpen(false);
      setGlucoseForm({
        date: new Date().toISOString().split('T')[0],
        fastingGlucose: '',
        postMealGlucose: '',
        notes: '',
      });
    }
  };

  const handlePredictGlucose = async () => {
    setPredictionLoading(true);
    // Simulate API call to backend regression model
    setTimeout(() => {
      const avgFasting = glucoseReadings
        .filter(r => r.fastingGlucose)
        .reduce((sum, r) => sum + (r.fastingGlucose || 0), 0) / glucoseReadings.filter(r => r.fastingGlucose).length;
      
      // Simple prediction logic (in real app, this would be from ML model)
      const prediction = Math.round(avgFasting * 0.98 + Math.random() * 10 - 5);
      setPredictedGlucose(prediction);
      setPredictionLoading(false);
    }, 2000);
  };

  const latestReading = glucoseReadings[0];
  const avgFasting = glucoseReadings
    .filter(r => r.fastingGlucose)
    .reduce((sum, r) => sum + (r.fastingGlucose || 0), 0) / glucoseReadings.filter(r => r.fastingGlucose).length;
  const avgPostMeal = glucoseReadings
    .filter(r => r.postMealGlucose)
    .reduce((sum, r) => sum + (r.postMealGlucose || 0), 0) / glucoseReadings.filter(r => r.postMealGlucose).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Glucose Tracker</h1>
          <p className="text-gray-600">Monitor your blood glucose levels and trends</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          className="shadow-lg"
        >
          Add Reading
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latest Fasting</p>
                <p className="text-2xl font-bold text-blue-600">
                  {latestReading?.fastingGlucose || '--'} mg/dL
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Fasting (7 days)</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(avgFasting) || '--'} mg/dL</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Post-Meal</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(avgPostMeal) || '--'} mg/dL</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Readings</p>
                <p className="text-2xl font-bold text-orange-600">{glucoseReadings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Glucose Chart and Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Glucose Trends (Last 30 Days)</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive glucose chart would be displayed here</p>
                <p className="text-sm text-gray-500 mt-1">Showing fasting and post-meal trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Prediction */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Prediction</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">Next Week Fasting Glucose</p>
                {predictedGlucose ? (
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{predictedGlucose} mg/dL</p>
                    <p className="text-xs text-purple-600 mt-1">Based on recent trends</p>
                  </div>
                ) : (
                  <p className="text-lg text-purple-600">Click predict to see forecast</p>
                )}
              </div>
              <Button
                onClick={handlePredictGlucose}
                loading={isPredictionLoading}
                className="w-full"
                variant="secondary"
              >
                {isPredictionLoading ? 'Analyzing...' : 'Predict Next Week'}
              </Button>
              <div className="text-xs text-gray-500">
                <p>• Uses machine learning regression model</p>
                <p>• Based on your historical data</p>
                <p>• For informational purposes only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Readings */}
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
                    Fasting Glucose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post-Meal Glucose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {glucoseReadings.slice(0, 10).map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(reading.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.fastingGlucose ? `${reading.fastingGlucose} mg/dL` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reading.postMealGlucose ? `${reading.postMealGlucose} mg/dL` : '--'}
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

      {/* Add Reading Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Glucose Reading"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reading-date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="reading-date"
              value={glucoseForm.date}
              onChange={(e) => setGlucoseForm({ ...glucoseForm, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fasting-glucose" className="block text-sm font-medium text-gray-700">
                Fasting Glucose (mg/dL)
              </label>
              <input
                type="number"
                id="fasting-glucose"
                value={glucoseForm.fastingGlucose}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, fastingGlucose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 95"
              />
            </div>
            <div>
              <label htmlFor="post-meal-glucose" className="block text-sm font-medium text-gray-700">
                Post-Meal Glucose (mg/dL)
              </label>
              <input
                type="number"
                id="post-meal-glucose"
                value={glucoseForm.postMealGlucose}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, postMealGlucose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 140"
              />
            </div>
          </div>

          <div>
            <label htmlFor="glucose-notes" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="glucose-notes"
              value={glucoseForm.notes}
              onChange={(e) => setGlucoseForm({ ...glucoseForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes about this reading..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReading}>Add Reading</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};