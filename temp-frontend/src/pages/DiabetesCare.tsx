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
  Utensils,
  Zap,
  Dumbbell,
  Clock,
} from 'lucide-react';
import { mockDiabetesCareData } from '../data/mockData';
import { DiabetesCareData, GlucoseReading, FoodEntry, InsulinDose, ExerciseEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const DiabetesCare: React.FC = () => {
  const [diabetesData, setDiabetesData] = useLocalStorage<DiabetesCareData>('diabetesData', mockDiabetesCareData);
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isInsulinModalOpen, setIsInsulinModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isPredictionLoading, setPredictionLoading] = useState(false);
  const [predictedGlucose, setPredictedGlucose] = useState<number | null>(null);

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

  const handleAddGlucose = () => {
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
      setIsGlucoseModalOpen(false);
      setGlucoseForm({
        date: new Date().toISOString().split('T')[0],
        fastingGlucose: '',
        postMealGlucose: '',
        notes: '',
      });
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

  const handlePredictGlucose = async () => {
    setPredictionLoading(true);
    // Simulate AI prediction
    setTimeout(() => {
      const avgFasting = diabetesData.glucoseReadings
        .filter(r => r.fastingGlucose)
        .reduce((sum, r) => sum + (r.fastingGlucose || 0), 0) / diabetesData.glucoseReadings.filter(r => r.fastingGlucose).length;
      
      const prediction = Math.round(avgFasting * 0.98 + Math.random() * 10 - 5);
      setPredictedGlucose(prediction);
      setPredictionLoading(false);
    }, 2000);
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
                <p className="text-2xl font-bold text-blue-600">
                  {latestGlucose?.fastingGlucose || '--'} mg/dL
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
        {/* Glucose Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Glucose Trends</h3>
              <Button
                onClick={handlePredictGlucose}
                loading={isPredictionLoading}
                icon={Brain}
                size="sm"
                variant="outline"
              >
                AI Predict
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive glucose chart</p>
                <p className="text-sm text-gray-500 mt-1">Showing fasting and post-meal trends</p>
                {predictedGlucose && (
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-700">Next Week Prediction</p>
                    <p className="text-xl font-bold text-purple-600">{predictedGlucose} mg/dL</p>
                  </div>
                )}
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
              >
                Set Glucose Target
              </Button>
              <Button
                icon={Calendar}
                className="w-full justify-start"
                variant="outline"
              >
                Schedule Reminder
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
            <Button variant="outline" onClick={() => setIsGlucoseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGlucose}>Add Reading</Button>
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
    </div>
  );
};