import React, { useState } from 'react';
import { useHealthData } from '../../hooks/useHealthData';
import { useAuth } from '../../hooks/useAuth';

export const ApiTest: React.FC = () => {
  const { user, logout } = useAuth();
  const { healthData, isLoading, error, addHealthData } = useHealthData();
  const [newEntry, setNewEntry] = useState({
    type: 'glucose',
    value: '',
    unit: 'mg/dL',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.value) return;

    setIsSubmitting(true);
    try {
      await addHealthData({
        type: newEntry.type,
        value: parseFloat(newEntry.value),
        unit: newEntry.unit,
      });
      setNewEntry({ type: 'glucose', value: '', unit: 'mg/dL' });
    } catch (err) {
      console.error('Failed to add health data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">API Connection Test</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        {user && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">✅ Authentication Working</h2>
            <p className="text-green-700">Welcome, {user.name}!</p>
            <p className="text-sm text-green-600">Email: {user.email}</p>
            {user.abhaId && <p className="text-sm text-green-600">ABHA ID: {user.abhaId}</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Health Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={newEntry.type}
              onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="glucose">Glucose</option>
              <option value="blood_pressure_systolic">Blood Pressure (Systolic)</option>
              <option value="blood_pressure_diastolic">Blood Pressure (Diastolic)</option>
              <option value="weight">Weight</option>
              <option value="heart_rate">Heart Rate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="number"
              value={newEntry.value}
              onChange={(e) => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter value"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={newEntry.unit}
              onChange={(e) => setNewEntry(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., mg/dL, kg, bpm"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Health Data'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Health Data Records</h2>
        
        {isLoading && (
          <div className="text-center py-4">Loading health data...</div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {!isLoading && healthData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No health data records found. Add some data above to test the API connection.
          </div>
        )}
        
        {healthData.length > 0 && (
          <div className="space-y-3">
            {healthData.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{entry.type}</h3>
                    <p className="text-lg text-blue-600">
                      {entry.value} {entry.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()} at{' '}
                      {new Date(entry.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ From API
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
