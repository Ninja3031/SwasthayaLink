import React, { useState } from 'react';
import axios from 'axios';
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
  Utensils,
  Zap,
  Dumbbell,
  Clock,
  Bell,
  Settings,
  Loader2,
} from 'lucide-react';
import { mockDiabetesCareData } from '../data/mockData';
import { DiabetesCareData, GlucoseReading, FoodEntry, InsulinDose, ExerciseEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGlucoseTargets } from '../hooks/useGlucoseTargets';
import { useHealthData } from '../hooks/useHealthData';

export const DiabetesCare: React.FC = () => {
  const [diabetesData, setDiabetesData] = useLocalStorage<DiabetesCareData>('diabetesData', mockDiabetesCareData);
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isInsulinModalOpen, setIsInsulinModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPredictionLoading, setPredictionLoading] = useState(false);
  const [predictedGlucose, setPredictedGlucose] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // Hooks for glucose targets and health data
  const {
    targets,
    updateTargets,
    updateReminderSettings,
    isWithinTarget,
    getTargetRange,
    getStatusColor,
    getStatusText
  } = useGlucoseTargets();
  const { addHealthData } = useHealthData();

  const [glucoseForm, setGlucoseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fastingGlucose: '',
    postMealGlucose: '',
    notes: '',
  });

  const [foodForm, setFoodForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    foodItems: '',
    carbohydrates: '',
    calories: '',
    notes: '',
  });

  const [insulinForm, setInsulinForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'rapid' as 'rapid' | 'long_acting' | 'intermediate',
    units: '',
    notes: '',
  });

  const [exerciseForm, setExerciseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    intensity: 'moderate' as 'low' | 'moderate' | 'high',
    caloriesBurned: '',
    notes: '',
  });

  // Target and reminder forms
  const [targetForm, setTargetForm] = useState({
    fastingMin: 70,
    fastingMax: 100,
    postMealMin: 70,
    postMealMax: 140,
    randomMin: 70,
    randomMax: 125,
  });

  const [reminderForm, setReminderForm] = useState({
    reminderEnabled: true,
    reminderTimes: [
      { time: '08:00', type: 'fasting' as const, enabled: true },
      { time: '14:00', type: 'post_meal' as const, enabled: true },
      { time: '20:00', type: 'random' as const, enabled: true }
    ],
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  // Prediction form state
  const [predictionForm, setPredictionForm] = useState({
    age: 0,
    bmi: 0,
    cholesterol: 0,
    prev_fasting: 0,
    bp: 0,
    smoking: '',
  });

  // Initialize forms when targets are loaded
  React.useEffect(() => {
    if (targets) {
      setTargetForm({
        fastingMin: targets.fastingMin,
        fastingMax: targets.fastingMax,
        postMealMin: targets.postMealMin,
        postMealMax: targets.postMealMax,
        randomMin: targets.randomMin,
        randomMax: targets.randomMax,
      });
      setReminderForm({
        reminderEnabled: targets.reminderEnabled,
        reminderTimes: targets.reminderTimes,
        reminderDays: targets.reminderDays
      });
    }
  }, [targets]);

  // Auto-populate prediction form with available data
  React.useEffect(() => {
    const latestGlucose = diabetesData.glucoseReadings[0];
    if (latestGlucose?.fastingGlucose && predictionForm.prev_fasting === 0) {
      setPredictionForm(prev => ({
        ...prev,
        prev_fasting: latestGlucose.fastingGlucose || 0
      }));
    }
  }, [diabetesData.glucoseReadings, predictionForm.prev_fasting]);

  const handleAddGlucose = async () => {
    try {
      setIsSubmitting(true);

      // Add fasting glucose if provided
      if (glucoseForm.fastingGlucose) {
        await handleAddGlucoseReading('fasting', parseInt(glucoseForm.fastingGlucose));
      }

      // Add post-meal glucose if provided
      if (glucoseForm.postMealGlucose) {
        await handleAddGlucoseReading('post_meal', parseInt(glucoseForm.postMealGlucose));
      }

      // Also update local state for immediate UI feedback
      if (glucoseForm.fastingGlucose || glucoseForm.postMealGlucose) {
        const newReading: GlucoseReading = {
          id: Date.now().toString(),
          date: glucoseForm.date,
          fastingGlucose: glucoseForm.fastingGlucose ? parseInt(glucoseForm.fastingGlucose) : undefined,
          postMealGlucose: glucoseForm.postMealGlucose ? parseInt(glucoseForm.postMealGlucose) : undefined,
          type: glucoseForm.fastingGlucose ? 'fasting' : 'post_meal',
          notes: glucoseForm.notes,
        };
        setDiabetesData({
          ...diabetesData,
          glucoseReadings: [newReading, ...diabetesData.glucoseReadings],
        });
      }

      setIsGlucoseModalOpen(false);
      setGlucoseForm({
        date: new Date().toISOString().split('T')[0],
        fastingGlucose: '',
        postMealGlucose: '',
        notes: '',
      });
      setSuccess('Glucose readings added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add glucose readings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFood = () => {
    if (foodForm.foodItems && foodForm.carbohydrates) {
      const newFood: FoodEntry = {
        id: Date.now().toString(),
        date: foodForm.date,
        mealType: foodForm.mealType,
        foodItems: foodForm.foodItems.split(',').map(item => item.trim()),
        carbohydrates: parseInt(foodForm.carbohydrates),
        calories: parseInt(foodForm.calories) || 0,
        notes: foodForm.notes,
      };
      setDiabetesData({
        ...diabetesData,
        foodIntake: [newFood, ...diabetesData.foodIntake],
      });
      setIsFoodModalOpen(false);
      setFoodForm({
        date: new Date().toISOString().split('T')[0],
        mealType: 'breakfast',
        foodItems: '',
        carbohydrates: '',
        calories: '',
        notes: '',
      });
    }
  };

  const handleAddInsulin = () => {
    if (insulinForm.time && insulinForm.units) {
      const newInsulin: InsulinDose = {
        id: Date.now().toString(),
        date: insulinForm.date,
        time: insulinForm.time,
        type: insulinForm.type,
        units: parseInt(insulinForm.units),
        notes: insulinForm.notes,
      };
      setDiabetesData({
        ...diabetesData,
        insulinDoses: [newInsulin, ...diabetesData.insulinDoses],
      });
      setIsInsulinModalOpen(false);
      setInsulinForm({
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'rapid',
        units: '',
        notes: '',
      });
    }
  };

  const handleAddExercise = () => {
    if (exerciseForm.type && exerciseForm.duration) {
      const newExercise: ExerciseEntry = {
        id: Date.now().toString(),
        date: exerciseForm.date,
        type: exerciseForm.type,
        duration: parseInt(exerciseForm.duration),
        intensity: exerciseForm.intensity,
        caloriesBurned: parseInt(exerciseForm.caloriesBurned) || undefined,
        notes: exerciseForm.notes,
      };
      setDiabetesData({
        ...diabetesData,
        exerciseLog: [newExercise, ...diabetesData.exerciseLog],
      });
      setIsExerciseModalOpen(false);
      setExerciseForm({
        date: new Date().toISOString().split('T')[0],
        type: '',
        duration: '',
        intensity: 'moderate',
        caloriesBurned: '',
        notes: '',
      });
    }
  };

  const handlePredictionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPredictionForm(prev => ({
      ...prev,
      [name]: name === 'smoking' ? value : parseFloat(value) || 0
    }));
  };

  const handlePredictGlucose = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictionLoading(true);

    try {
      // Call the ML model API
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...predictionForm,
          smoking: parseInt(predictionForm.smoking)
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      const data = await response.json();
      setPredictedGlucose(Math.round(data.predicted_future_fasting));
      setSuccess('Prediction generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Prediction request failed:', error);

      // Fallback to simulated prediction if API is not available
      const avgFasting = diabetesData.glucoseReadings
        .filter(r => r.fastingGlucose)
        .reduce((sum, r) => sum + (r.fastingGlucose || 0), 0) / diabetesData.glucoseReadings.filter(r => r.fastingGlucose).length;

      const fallbackPrediction = Math.round((avgFasting || predictionForm.prev_fasting) * 0.98 + Math.random() * 10 - 5);
      setPredictedGlucose(fallbackPrediction);
      setSuccess('Prediction generated using fallback model (API unavailable)');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleUpdateTargets = async () => {
    try {
      setIsSubmitting(true);
      await updateTargets(targetForm);
      setSuccess('Glucose targets updated successfully!');
      setIsTargetModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update targets:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReminders = async () => {
    try {
      setIsSubmitting(true);
      await updateReminderSettings(reminderForm);
      setSuccess('Reminder settings updated successfully!');
      setIsReminderModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update reminders:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGlucoseReading = async (type: 'fasting' | 'post_meal' | 'random', value: number) => {
    try {
      await addHealthData({
        type: 'glucose',
        value: value,
        unit: 'mg/dL',
        type: type,
        notes: `Added from Diabetes Care - ${type} reading`
      });
      setSuccess('Glucose reading added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add glucose reading:', error);
    }
  };

  const latestGlucose = diabetesData.glucoseReadings[0];
  const todayFood = diabetesData.foodIntake.filter(f => f.date === new Date().toISOString().split('T')[0]);
  const todayInsulin = diabetesData.insulinDoses.filter(i => i.date === new Date().toISOString().split('T')[0]);
  const weeklyExercise = diabetesData.exerciseLog.filter(e => {
    const exerciseDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return exerciseDate >= weekAgo;
  });

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diabetes Care Tools</h1>
          <p className="text-gray-600">Comprehensive diabetes management and monitoring</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsGlucoseModalOpen(true)}
            icon={Plus}
            size="sm"
          >
            Glucose
          </Button>
          <Button
            onClick={() => setIsFoodModalOpen(true)}
            icon={Utensils}
            size="sm"
            variant="outline"
          >
            Food
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Latest Glucose</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {latestGlucose?.fastingGlucose || '--'} mg/dL
                  </p>
                  {latestGlucose?.fastingGlucose && targets && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isWithinTarget(latestGlucose.fastingGlucose, 'fasting')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(latestGlucose.fastingGlucose, 'fasting')}
                    </span>
                  )}
                </div>
                {targets && (
                  <p className="text-xs text-gray-500 mt-1">
                    Target: {targets.fastingMin}-{targets.fastingMax} mg/dL
                  </p>
                )}
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Meals</p>
                <p className="text-2xl font-bold text-green-600">{todayFood.length}</p>
              </div>
              <Utensils className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Insulin</p>
                <p className="text-2xl font-bold text-purple-600">
                  {todayInsulin.reduce((sum, dose) => sum + dose.units, 0)} units
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weekly Exercise</p>
                <p className="text-2xl font-bold text-orange-600">
                  {weeklyExercise.reduce((sum, ex) => sum + ex.duration, 0)} min
                </p>
              </div>
              <Dumbbell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fasting Blood Sugar Prediction Model */}
        <Card className="lg:col-span-2" data-prediction-section>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fasting Blood Sugar Prediction</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">AI Model</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🤖 AI-Powered Prediction</h4>
                <p className="text-sm text-blue-700">
                  Our machine learning model analyzes your health parameters to predict future fasting blood sugar levels.
                  This helps you understand potential trends and take preventive measures.
                </p>
              </div>

              <form onSubmit={handlePredictGlucose} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={predictionForm.age}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 45"
                      required
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BMI (Body Mass Index) *
                    </label>
                    <input
                      type="number"
                      name="bmi"
                      value={predictionForm.bmi}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 25.5"
                      required
                      min="15"
                      max="50"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cholesterol Level (mg/dL) *
                    </label>
                    <input
                      type="number"
                      name="cholesterol"
                      value={predictionForm.cholesterol}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 180"
                      required
                      min="100"
                      max="400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous Fasting Glucose (mg/dL) *
                    </label>
                    <input
                      type="number"
                      name="prev_fasting"
                      value={predictionForm.prev_fasting}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 95"
                      required
                      min="70"
                      max="300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Pressure (Systolic) *
                    </label>
                    <input
                      type="number"
                      name="bp"
                      value={predictionForm.bp}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 120"
                      required
                      min="90"
                      max="200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Smoking Status *
                    </label>
                    <select
                      name="smoking"
                      value={predictionForm.smoking}
                      onChange={handlePredictionFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select smoking status</option>
                      <option value="0">Non-smoker</option>
                      <option value="1">Current smoker</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={isPredictionLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                  >
                    {isPredictionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Predict Future Fasting Glucose
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {predictedGlucose !== null && (
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-purple-900 mb-2">🎯 Prediction Result</h4>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {predictedGlucose} mg/dL
                    </div>
                    <p className="text-sm text-purple-700 mb-4">Predicted Future Fasting Glucose Level</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Normal Range</p>
                        <p className="text-sm font-medium text-green-600">70-100 mg/dL</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Pre-diabetes</p>
                        <p className="text-sm font-medium text-yellow-600">100-125 mg/dL</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Diabetes</p>
                        <p className="text-sm font-medium text-red-600">≥126 mg/dL</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Your Prediction Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        predictedGlucose < 100
                          ? 'bg-green-100 text-green-800'
                          : predictedGlucose < 126
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {predictedGlucose < 100
                          ? '✅ Normal Range'
                          : predictedGlucose < 126
                          ? '⚠️ Pre-diabetes Range'
                          : '🚨 Diabetes Range'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-gray-600" />
                  How This Prediction Works
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <strong>Machine Learning Model:</strong> Uses advanced regression algorithms trained on health data</p>
                  <p>• <strong>Key Factors:</strong> Age, BMI, cholesterol, previous glucose levels, blood pressure, and smoking status</p>
                  <p>• <strong>Accuracy:</strong> Predictions are estimates based on statistical patterns, not medical diagnoses</p>
                  <p>• <strong>Usage:</strong> Use this tool to understand trends and discuss results with your healthcare provider</p>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Important:</strong> This prediction is for informational purposes only.
                    Always consult with your healthcare provider for medical decisions and treatment plans.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => setIsInsulinModalOpen(true)}
                icon={Zap}
                className="w-full justify-start"
                variant="outline"
              >
                Log Insulin Dose
              </Button>
              <Button
                onClick={() => setIsExerciseModalOpen(true)}
                icon={Dumbbell}
                className="w-full justify-start"
                variant="outline"
              >
                Log Exercise
              </Button>
              <Button
                icon={Target}
                className="w-full justify-start"
                variant="outline"
                onClick={() => setIsTargetModalOpen(true)}
              >
                Set Glucose Target
              </Button>
              <Button
                icon={Bell}
                className="w-full justify-start"
                variant="outline"
                onClick={() => setIsReminderModalOpen(true)}
              >
                Schedule Reminder
              </Button>
              <Button
                icon={Brain}
                className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                variant="outline"
                onClick={() => {
                  // Scroll to prediction section
                  const predictionSection = document.querySelector('[data-prediction-section]');
                  if (predictionSection) {
                    predictionSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                AI Glucose Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Food Intake */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Food Intake</h3>
              <Utensils className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diabetesData.foodIntake.slice(0, 5).map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{food.mealType}</p>
                    <p className="text-xs text-gray-600">{food.foodItems.join(', ')}</p>
                    <p className="text-xs text-gray-500">{food.carbohydrates}g carbs • {food.calories} cal</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(food.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exercise */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Exercise</h3>
              <Dumbbell className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diabetesData.exerciseLog.slice(0, 5).map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{exercise.type}</p>
                    <p className="text-xs text-gray-600">
                      {exercise.duration} min • {exercise.intensity} intensity
                    </p>
                    {exercise.caloriesBurned && (
                      <p className="text-xs text-gray-500">{exercise.caloriesBurned} calories burned</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(exercise.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {/* Glucose Modal */}
      <Modal
        isOpen={isGlucoseModalOpen}
        onClose={() => setIsGlucoseModalOpen(false)}
        title="Add Glucose Reading"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              value={glucoseForm.date}
              onChange={(e) => setGlucoseForm({ ...glucoseForm, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                value={glucoseForm.fastingGlucose}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, fastingGlucose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Post-Meal Glucose (mg/dL)</label>
              <input
                type="number"
                value={glucoseForm.postMealGlucose}
                onChange={(e) => setGlucoseForm({ ...glucoseForm, postMealGlucose: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="140"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={glucoseForm.notes}
              onChange={(e) => setGlucoseForm({ ...glucoseForm, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsGlucoseModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGlucose}
              disabled={isSubmitting || (!glucoseForm.fastingGlucose && !glucoseForm.postMealGlucose)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Reading'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Food Modal */}
      <Modal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        title="Log Food Intake"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={foodForm.date}
                onChange={(e) => setFoodForm({ ...foodForm, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meal Type *</label>
              <select
                value={foodForm.mealType}
                onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Food Items *</label>
            <input
              type="text"
              value={foodForm.foodItems}
              onChange={(e) => setFoodForm({ ...foodForm, foodItems: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Rice, Chicken, Vegetables (comma separated)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Carbohydrates (g) *</label>
              <input
                type="number"
                value={foodForm.carbohydrates}
                onChange={(e) => setFoodForm({ ...foodForm, carbohydrates: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                value={foodForm.calories}
                onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="350"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsFoodModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFood}>Log Food</Button>
          </div>
        </div>
      </Modal>

      {/* Insulin Modal */}
      <Modal
        isOpen={isInsulinModalOpen}
        onClose={() => setIsInsulinModalOpen(false)}
        title="Log Insulin Dose"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date *</label>
              <input
                type="date"
                value={insulinForm.date}
                onChange={(e) => setInsulinForm({ ...insulinForm, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time *</label>
              <input
                type="time"
                value={insulinForm.time}
                onChange={(e) => setInsulinForm({ ...insulinForm, time: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Insulin Type *</label>
              <select
                value={insulinForm.type}
                onChange={(e) => setInsulinForm({ ...insulinForm, type: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="rapid">Rapid Acting</option>
                <option value="long_acting">Long Acting</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Units *</label>
              <input
                type="number"
                value={insulinForm.units}
                onChange={(e) => setInsulinForm({ ...insulinForm, units: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="8"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsInsulinModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddInsulin}>Log Insulin</Button>
          </div>
        </div>
      </Modal>

      {/* Exercise Modal */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        title="Log Exercise"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              value={exerciseForm.date}
              onChange={(e) => setExerciseForm({ ...exerciseForm, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exercise Type *</label>
              <input
                type="text"
                value={exerciseForm.type}
                onChange={(e) => setExerciseForm({ ...exerciseForm, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Walking, Cycling"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes) *</label>
              <input
                type="number"
                value={exerciseForm.duration}
                onChange={(e) => setExerciseForm({ ...exerciseForm, duration: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Intensity</label>
              <select
                value={exerciseForm.intensity}
                onChange={(e) => setExerciseForm({ ...exerciseForm, intensity: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Calories Burned</label>
              <input
                type="number"
                value={exerciseForm.caloriesBurned}
                onChange={(e) => setExerciseForm({ ...exerciseForm, caloriesBurned: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="150"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsExerciseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExercise}>Log Exercise</Button>
          </div>
        </div>
      </Modal>

      {/* Glucose Target Settings Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Set Glucose Targets"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">About Glucose Targets</h4>
            <p className="text-sm text-blue-700">
              Set personalized glucose target ranges to help monitor your diabetes management.
              These targets will be used to provide feedback on your glucose readings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fasting Targets */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Fasting Glucose
              </h4>
              <p className="text-sm text-gray-600">Target range for fasting glucose (before meals)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600">Min (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.fastingMin}
                    onChange={(e) => setTargetForm({...targetForm, fastingMin: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Max (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.fastingMax}
                    onChange={(e) => setTargetForm({...targetForm, fastingMax: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="200"
                  />
                </div>
              </div>
            </div>

            {/* Post-Meal Targets */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Utensils className="h-4 w-4 mr-2 text-green-600" />
                Post-Meal Glucose
              </h4>
              <p className="text-sm text-gray-600">Target range 2 hours after meals</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600">Min (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.postMealMin}
                    onChange={(e) => setTargetForm({...targetForm, postMealMin: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Max (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.postMealMax}
                    onChange={(e) => setTargetForm({...targetForm, postMealMax: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="300"
                  />
                </div>
              </div>
            </div>

            {/* Random Targets */}
            <div className="space-y-3 md:col-span-2">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-600" />
                Random Glucose
              </h4>
              <p className="text-sm text-gray-600">Target range for random glucose checks</p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div>
                  <label className="block text-sm text-gray-600">Min (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.randomMin}
                    onChange={(e) => setTargetForm({...targetForm, randomMin: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="250"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Max (mg/dL)</label>
                  <input
                    type="number"
                    value={targetForm.randomMax}
                    onChange={(e) => setTargetForm({...targetForm, randomMax: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="50"
                    max="250"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> These targets should be set in consultation with your healthcare provider.
              Default values are based on general guidelines but may not be suitable for everyone.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTargetModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTargets}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Targets'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Glucose Reminder Settings Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Schedule Glucose Reminders"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Smart Glucose Reminders</h4>
            <p className="text-sm text-green-700">
              Set up personalized reminders to help you maintain consistent glucose monitoring.
              You can customize reminder times and types based on your daily routine.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="reminder-enabled"
              checked={reminderForm.reminderEnabled}
              onChange={(e) => setReminderForm({...reminderForm, reminderEnabled: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reminder-enabled" className="text-sm font-medium text-gray-900">
              Enable glucose testing reminders
            </label>
          </div>

          {reminderForm.reminderEnabled && (
            <>
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Reminder Times
                </h4>
                <div className="space-y-3">
                  {reminderForm.reminderTimes.map((reminder, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        onChange={(e) => {
                          const newTimes = [...reminderForm.reminderTimes];
                          newTimes[index].enabled = e.target.checked;
                          setReminderForm({...reminderForm, reminderTimes: newTimes});
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Clock className="h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={reminder.time}
                        onChange={(e) => {
                          const newTimes = [...reminderForm.reminderTimes];
                          newTimes[index].time = e.target.value;
                          setReminderForm({...reminderForm, reminderTimes: newTimes});
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={reminder.type}
                        onChange={(e) => {
                          const newTimes = [...reminderForm.reminderTimes];
                          newTimes[index].type = e.target.value as any;
                          setReminderForm({...reminderForm, reminderTimes: newTimes});
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fasting">Fasting Check</option>
                        <option value="post_meal">Post-Meal Check</option>
                        <option value="random">Random Check</option>
                      </select>
                      <span className="text-xs text-gray-500">
                        {reminder.type === 'fasting' && '🌅 Before breakfast'}
                        {reminder.type === 'post_meal' && '🍽️ After meals'}
                        {reminder.type === 'random' && '🔄 Anytime'}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReminderForm({
                      ...reminderForm,
                      reminderTimes: [
                        ...reminderForm.reminderTimes,
                        { time: '12:00', type: 'random', enabled: true }
                      ]
                    });
                  }}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Reminder Days
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={reminderForm.reminderDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReminderForm({
                              ...reminderForm,
                              reminderDays: [...reminderForm.reminderDays, day]
                            });
                          } else {
                            setReminderForm({
                              ...reminderForm,
                              reminderDays: reminderForm.reminderDays.filter(d => d !== day)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Reminder Tips</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Fasting reminders work best in the morning before breakfast</li>
                  <li>• Post-meal reminders should be 2 hours after eating</li>
                  <li>• Random checks help track glucose patterns throughout the day</li>
                  <li>• Consistent timing helps build healthy monitoring habits</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsReminderModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReminders}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Reminders'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};