export interface User {
  id: string;
  name: string;
  email: string;
  abhaId: string;
  photo?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  emergencyContact?: string;
  userType: 'patient' | 'doctor';
  // Doctor specific fields
  specialization?: string;
  licenseNumber?: string;
  hospital?: string;
  experience?: number;
  consultationFee?: number;
  availableSlots?: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface HealthRecord {
  id: string;
  title: string;
  date: string;
  type: 'blood_test' | 'scan' | 'prescription' | 'general' | 'clinical_note' | 'ocr_report';
  highlights: {
    bp?: string;
    glucose?: string;
    cholesterol?: string;
    [key: string]: string | undefined;
  };
  file?: File;
  doctor?: string;
  hospital?: string;
  patientId?: string;
  doctorId?: string;
  isImportant?: boolean;
  ocrData?: OCRData;
  clinicalNotes?: string;
}

export interface OCRData {
  extractedText: string;
  structuredData: {
    patientName?: string;
    testDate?: string;
    bloodPressure?: string;
    glucose?: string;
    cholesterol?: string;
    hemoglobin?: string;
    [key: string]: string | undefined;
  };
  confidence: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  timeOfDay: string[];
  instructions?: string;
  taken: boolean;
  lastTaken?: string;
  prescribedBy?: string;
  pharmacyStatus?: 'pending' | 'filled' | 'ready' | 'delivered';
  refillsRemaining?: number;
}

export interface Appointment {
  id: string;
  doctorName: string;
  doctorId?: string;
  patientName?: string;
  patientId?: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed';
  notes?: string;
  hospital?: string;
  specialty?: string;
  consultationFee?: number;
  estimatedDuration?: number;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'medication' | 'appointment' | 'report' | 'system' | 'prescription' | 'lab_result';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  userId: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  doctorName: string;
  doctorPhoto?: string;
  patientName?: string;
  patientPhoto?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
  participantType: 'patient' | 'doctor';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isDoctor: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'prescription';
  url: string;
  size: number;
}

export interface GlucoseReading {
  id: string;
  date: string;
  fastingGlucose?: number;
  postMealGlucose?: number;
  type: 'fasting' | 'random' | 'post_meal';
  notes?: string;
  patientId?: string;
}

export interface VitalReading {
  id: string;
  date: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'cholesterol' | 'sleep';
  value: {
    systolic?: number;
    diastolic?: number;
    heartRate?: number;
    weight?: number;
    cholesterol?: number;
    sleepHours?: number;
    sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  };
  notes?: string;
  patientId?: string;
}

export interface UserSettings {
  medicationReminders: boolean;
  appointmentReminders: boolean;
  customReminders: CustomReminder[];
  dataSharing: DataSharingSettings;
  privacy: PrivacySettings;
}

export interface DataSharingSettings {
  shareWithDoctors: boolean;
  shareWithHospitals: boolean;
  shareWithPharmacies: boolean;
  uhiIntegration: boolean;
  consentLogs: ConsentLog[];
}

export interface ConsentLog {
  id: string;
  entityName: string;
  entityType: 'doctor' | 'hospital' | 'pharmacy' | 'lab';
  dataTypes: string[];
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'doctors_only' | 'private';
  allowDataAnalytics: boolean;
  allowResearchParticipation: boolean;
}

export interface CustomReminder {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
}

export interface DiabetesCareData {
  glucoseReadings: GlucoseReading[];
  foodIntake: FoodEntry[];
  insulinDoses: InsulinDose[];
  exerciseLog: ExerciseEntry[];
}

export interface FoodEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: string[];
  carbohydrates: number;
  calories: number;
  notes?: string;
}

export interface InsulinDose {
  id: string;
  date: string;
  time: string;
  type: 'rapid' | 'long_acting' | 'intermediate';
  units: number;
  notes?: string;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  type: string;
  duration: number; // in minutes
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  medications: PrescribedMedication[];
  diagnosis: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  pharmacyId?: string;
  fulfillmentStatus?: 'pending' | 'processing' | 'ready' | 'delivered';
}

export interface PrescribedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refills: number;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  prescription?: Prescription;
  followUpDate?: string;
  notes: string;
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  specialties: string[];
  facilities: string[];
  rating: number;
  estimatedWaitTime: number; // in minutes
  consultationFees: {
    general: number;
    specialist: number;
    emergency: number;
  };
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  deliveryAvailable: boolean;
  estimatedDeliveryTime?: number; // in minutes
  rating: number;
}