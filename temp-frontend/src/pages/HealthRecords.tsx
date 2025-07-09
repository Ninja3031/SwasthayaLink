import React, { useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { reportService, type Report } from '../services';

export const HealthRecords: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Fetching reports...');
      const fetchedReports = await reportService.getReports();
      console.log('Fetched reports:', fetchedReports);

      // Ensure all reports have proper IDs for React keys
      const reportsWithIds = fetchedReports.map(report => ({
        ...report,
        id: report.id || (report as any)._id || `report-${Date.now()}-${Math.random()}`
      }));

      setReports(reportsWithIds);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(err.response?.data?.error || 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file type (JPEG, PNG, PDF)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadReport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Starting upload for file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      const result = await reportService.uploadReport(selectedFile);
      console.log('Upload successful:', result);
      console.log('Report data:', result.report);

      // Add the new report to the list with proper ID mapping
      const newReport = {
        ...result.report,
        id: (result.report as any)._id || result.report.id, // Handle MongoDB _id
      };

      setReports([newReport, ...reports]);

      // Show appropriate success message based on OCR status
      if (result.report.ocrResult?.error) {
        setSuccess('Report uploaded successfully! OCR processing is currently unavailable, but your file is safely stored.');
      } else {
        setSuccess('Report uploaded and processed successfully!');
      }

      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload failed:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportService.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      setSuccess('Report deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete report');
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (fileType.includes('image')) return <Eye className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          disabled={isLoading}
        >
          Upload Report
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                )}
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">OCR Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.ocrResult && !r.ocrResult.error).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const now = new Date();
                    return reportDate.getMonth() === now.getMonth() &&
                           reportDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">File Types</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(reports.map(r => r.fileType.split('/')[0])).size}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports uploaded yet</h3>
            <p className="text-gray-600 mb-4">Upload your first medical report to get started with OCR processing.</p>
            <Button onClick={() => setIsUploadModalOpen(true)} icon={Upload}>
              Upload Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(report.fileType)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {report.filePath.split('/').pop() || 'Medical Report'}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>

                  {/* OCR Results */}
                  {report.ocrResult && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">OCR Processing</p>
                      {report.ocrResult.error ? (
                        <div className="flex items-center text-xs text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>OCR service unavailable</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>Successfully processed</span>
                          </div>
                          {(report.ocrResult.extractedText || report.ocrResult.extracted_text) && (
                            <p className="text-xs text-gray-600 truncate">
                              {(report.ocrResult.extractedText || report.ocrResult.extracted_text).substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => handleViewReport(report)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Download}
                      className="flex-1"
                      onClick={() => window.open(`/api/reports/${report.id}/download`, '_blank')}
                    >
                      Download
                    </Button>
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setError('');
        }}
        title="Upload Medical Report"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPEG, PNG, PDF (Max 10MB)
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileTypeIcon(selectedFile.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Activity className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">OCR Processing</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your uploaded report will be automatically processed using OCR technology to extract key medical information and make it searchable.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
                setError('');
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadReport}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading & Processing...
                </>
              ) : (
                'Upload Report'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">File Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedReport.filePath.split('/').pop()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.fileType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  {selectedReport.ocrResult?.error ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      OCR Unavailable
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      OCR Processed
                    </span>
                  )}
                </p>
              </div>
            </div>

            {selectedReport.ocrResult && !selectedReport.ocrResult.error && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Text
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedReport.ocrResult.extractedText || selectedReport.ocrResult.extracted_text || 'No text extracted'}
                  </p>
                </div>
              </div>
            )}

            {(selectedReport.ocrResult?.structuredData || selectedReport.ocrResult?.structured_data) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structured Data
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                    {JSON.stringify(selectedReport.ocrResult.structuredData || selectedReport.ocrResult.structured_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => window.open(`/api/reports/${selectedReport.id}/download`, '_blank')}
                icon={Download}
              >
                Download Original
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
