import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Scan,
  Upload,
  FileText,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap,
} from 'lucide-react';
import { mockHealthRecords } from '../data/mockData';
import { HealthRecord, OCRData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const OCRReports: React.FC = () => {
  const [healthRecords, setHealthRecords] = useLocalStorage<HealthRecord[]>('healthRecords', mockHealthRecords);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HealthRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    doctor: '',
    hospital: '',
    notes: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      
      // Simulate OCR processing with PaddleOCR
      setTimeout(() => {
        const mockOCRData: OCRData = {
          extractedText: `Patient Name: ${uploadForm.title || 'John Doe'}
Date: ${new Date().toLocaleDateString()}
Blood Pressure: ${Math.floor(Math.random() * 30 + 110)}/${Math.floor(Math.random() * 20 + 70)}
Glucose: ${Math.floor(Math.random() * 40 + 80)} mg/dL
Cholesterol: ${Math.floor(Math.random() * 50 + 150)} mg/dL
Hemoglobin: ${(Math.random() * 3 + 12).toFixed(1)} g/dL
Doctor: ${uploadForm.doctor || 'Dr. Smith'}
Hospital: ${uploadForm.hospital || 'General Hospital'}`,
          structuredData: {
            patientName: uploadForm.title || 'John Doe',
            testDate: new Date().toISOString().split('T')[0],
            bloodPressure: `${Math.floor(Math.random() * 30 + 110)}/${Math.floor(Math.random() * 20 + 70)}`,
            glucose: `${Math.floor(Math.random() * 40 + 80)} mg/dL`,
            cholesterol: `${Math.floor(Math.random() * 50 + 150)} mg/dL`,
            hemoglobin: `${(Math.random() * 3 + 12).toFixed(1)} g/dL`,
          },
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        };

        const newRecord: HealthRecord = {
          id: Date.now().toString(),
          title: uploadForm.title || `OCR Report - ${file.name}`,
          date: new Date().toISOString().split('T')[0],
          type: 'ocr_report',
          highlights: {
            bp: mockOCRData.structuredData.bloodPressure || '',
            glucose: mockOCRData.structuredData.glucose || '',
            cholesterol: mockOCRData.structuredData.cholesterol || '',
            hemoglobin: mockOCRData.structuredData.hemoglobin || '',
          },
          doctor: uploadForm.doctor,
          hospital: uploadForm.hospital,
          file,
          ocrData: mockOCRData,
          isImportant: mockOCRData.confidence > 0.8,
        };

        setHealthRecords([newRecord, ...healthRecords]);
        setIsProcessing(false);
        setIsUploadModalOpen(false);
        setUploadForm({ title: '', doctor: '', hospital: '', notes: '' });
      }, 3000);
    }
  };

  const viewReport = (record: HealthRecord) => {
    setSelectedReport(record);
    setIsViewModalOpen(true);
  };

  const ocrReports = healthRecords.filter(record => record.type === 'ocr_report');
  const totalReports = ocrReports.length;
  const highConfidenceReports = ocrReports.filter(r => r.ocrData && r.ocrData.confidence > 0.8).length;
  const recentReports = ocrReports.filter(r => {
    const reportDate = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reportDate >= weekAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OCR Reports</h1>
          <p className="text-gray-600">Upload and process medical reports with AI-powered OCR</p>
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
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total OCR Reports</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              </div>
              <Scan className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Confidence</p>
                <p className="text-2xl font-bold text-green-600">{highConfidenceReports}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-purple-600">{recentReports}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-orange-600">
                  {ocrReports.length > 0 
                    ? Math.round(ocrReports.reduce((sum, r) => sum + (r.ocrData?.confidence || 0), 0) / ocrReports.length * 100)
                    : 0}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OCR Processing Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered OCR Processing</h3>
              <p className="text-gray-700 mb-3">
                Our advanced OCR system powered by PaddleOCR automatically extracts and structures data from your medical reports.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automatic text extraction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Structured data parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Confidence scoring</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ocrReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Scan className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        OCR Processed
                      </span>
                      {report.ocrData && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.ocrData.confidence > 0.8 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {Math.round(report.ocrData.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>Date: {new Date(report.date).toLocaleDateString()}</p>
                  {report.doctor && <p>Doctor: {report.doctor}</p>}
                  {report.hospital && <p>Hospital: {report.hospital}</p>}
                </div>

                {/* Extracted Data Preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Extracted Data</p>
                  <div className="space-y-1">
                    {Object.entries(report.highlights).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => viewReport(report)}
                    className="flex-1"
                  >
                    View Details
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

      {/* Empty State */}
      {ocrReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No OCR reports yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your medical reports to automatically extract and structure the data using AI-powered OCR.
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)} icon={Upload}>
              Upload Your First Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Medical Report for OCR Processing"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">AI-Powered OCR Processing</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Our system will automatically extract text and structure data from your medical report using advanced OCR technology.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="report-title" className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <input
              type="text"
              id="report-title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Blood Test Report - January 2024"
            />
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
                placeholder="Dr. Smith"
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
                placeholder="General Hospital"
              />
            </div>
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Upload Medical Report
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
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                <div>
                  <p className="text-sm text-purple-800 font-medium">Processing with AI OCR...</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Extracting text and structuring data from your medical report
                  </p>
                </div>
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

      {/* View Report Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedReport?.title || 'OCR Report Details'}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedReport.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">OCR Confidence</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">
                    {selectedReport.ocrData ? Math.round(selectedReport.ocrData.confidence * 100) : 0}%
                  </span>
                  {selectedReport.ocrData && selectedReport.ocrData.confidence > 0.8 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              {selectedReport.doctor && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Doctor</p>
                  <p className="text-sm text-gray-900">{selectedReport.doctor}</p>
                </div>
              )}
              {selectedReport.hospital && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Hospital</p>
                  <p className="text-sm text-gray-900">{selectedReport.hospital}</p>
                </div>
              )}
            </div>

            {/* Structured Data */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Extracted Structured Data</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedReport.ocrData?.structuredData && Object.entries(selectedReport.ocrData.structuredData).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <p className="text-xs font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Raw OCR Text */}
            {selectedReport.ocrData?.extractedText && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Raw Extracted Text</p>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {selectedReport.ocrData.extractedText}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" icon={Download}>
                Download Report
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