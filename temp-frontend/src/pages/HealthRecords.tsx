import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Calendar,
  User,
  Building,
  Activity,
  Zap,
} from 'lucide-react';
import { mockHealthRecords } from '../data/mockData';
import { HealthRecord } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const HealthRecords: React.FC = () => {
  const [healthRecords, setHealthRecords] = useLocalStorage<HealthRecord[]>('healthRecords', mockHealthRecords);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'general' as HealthRecord['type'],
    doctor: '',
    hospital: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate OCR processing
      setIsProcessing(true);
      setTimeout(() => {
        const newRecord: HealthRecord = {
          id: Date.now().toString(),
          title: uploadForm.title || file.name,
          date: new Date().toISOString().split('T')[0],
          type: uploadForm.type,
          highlights: generateMockHighlights(uploadForm.type),
          doctor: uploadForm.doctor,
          hospital: uploadForm.hospital,
          file,
        };
        setHealthRecords([newRecord, ...healthRecords]);
        setIsProcessing(false);
        setIsUploadModalOpen(false);
        setUploadForm({ title: '', type: 'general', doctor: '', hospital: '', notes: '' });
      }, 2000);
    }
  };

  const generateMockHighlights = (type: HealthRecord['type']) => {
    switch (type) {
      case 'blood_test':
        return {
          bp: Math.floor(Math.random() * 30 + 110) + '/' + Math.floor(Math.random() * 20 + 70),
          glucose: Math.floor(Math.random() * 40 + 80) + ' mg/dL',
          cholesterol: Math.floor(Math.random() * 50 + 150) + ' mg/dL',
          hemoglobin: Math.floor(Math.random() * 3 + 12) + ' g/dL',
        };
      case 'scan':
        return {
          result: Math.random() > 0.5 ? 'Normal' : 'Abnormal findings detected',
          organs: 'All organs appear normal',
        };
      case 'prescription':
        return {
          medications: Math.floor(Math.random() * 5 + 1) + ' prescribed',
          duration: Math.floor(Math.random() * 14 + 7) + ' days',
        };
      default:
        return {
          status: 'Report processed successfully',
        };
    }
  };

  const getRecordIcon = (type: HealthRecord['type']) => {
    switch (type) {
      case 'blood_test':
        return <Activity className="h-5 w-5 text-red-500" />;
      case 'scan':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'prescription':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRecordTypeColor = (type: HealthRecord['type']) => {
    switch (type) {
      case 'blood_test':
        return 'bg-red-100 text-red-800';
      case 'scan':
        return 'bg-blue-100 text-blue-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
          <p className="text-gray-600">Manage your medical reports and documents</p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          icon={Upload}
          className="shadow-lg"
        >
          Upload Report
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blood Tests</p>
                <p className="text-2xl font-bold text-red-600">
                  {healthRecords.filter(r => r.type === 'blood_test').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scans</p>
                <p className="text-2xl font-bold text-blue-600">
                  {healthRecords.filter(r => r.type === 'scan').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-green-600">
                  {healthRecords.filter(r => r.type === 'prescription').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-purple-600">{healthRecords.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getRecordIcon(record.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                      {record.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(record.date).toLocaleDateString()}
                </div>
                {record.doctor && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {record.doctor}
                  </div>
                )}
                {record.hospital && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {record.hospital}
                  </div>
                )}

                {/* Highlights */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Key Highlights</p>
                  <div className="space-y-1">
                    {Object.entries(record.highlights).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => viewRecord(record)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Download}
                    className="flex-1"
                  >
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Health Record"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="record-title" className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <input
              type="text"
              id="record-title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter report title"
            />
          </div>

          <div>
            <label htmlFor="record-type" className="block text-sm font-medium text-gray-700">
              Record Type
            </label>
            <select
              id="record-type"
              value={uploadForm.type}
              onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as HealthRecord['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="general">General Report</option>
              <option value="blood_test">Blood Test</option>
              <option value="scan">Scan/Imaging</option>
              <option value="prescription">Prescription</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctor-name" className="block text-sm font-medium text-gray-700">
                Doctor Name
              </label>
              <input
                type="text"
                id="doctor-name"
                value={uploadForm.doctor}
                onChange={(e) => setUploadForm({ ...uploadForm, doctor: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter doctor name"
              />
            </div>
            <div>
              <label htmlFor="hospital-name" className="block text-sm font-medium text-gray-700">
                Hospital/Clinic
              </label>
              <input
                type="text"
                id="hospital-name"
                value={uploadForm.hospital}
                onChange={(e) => setUploadForm({ ...uploadForm, hospital: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter hospital name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-sm text-blue-800">Processing with OCR... Extracting key information...</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Record Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedRecord?.title || 'Health Record'}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedRecord.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(selectedRecord.type)}`}>
                  {selectedRecord.type.replace('_', ' ')}
                </span>
              </div>
              {selectedRecord.doctor && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Doctor</p>
                  <p className="text-sm text-gray-900">{selectedRecord.doctor}</p>
                </div>
              )}
              {selectedRecord.hospital && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Hospital</p>
                  <p className="text-sm text-gray-900">{selectedRecord.hospital}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Key Highlights</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedRecord.highlights).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" icon={Download}>
                Download
              </Button>
              <Button onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};