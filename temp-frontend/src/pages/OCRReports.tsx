import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import {
  Scan,
  Upload,
  FileText,
  Eye,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const OCRReports: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Scan className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">OCR Report Processing</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your medical reports and let our AI-powered OCR technology extract key information automatically.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered OCR</h3>
            <p className="text-gray-600">
              Advanced machine learning algorithms extract text and data from medical reports with high accuracy.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Processing</h3>
            <p className="text-gray-600">
              Get your reports processed and structured data extracted in seconds, not hours.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Structured Data</h3>
            <p className="text-gray-600">
              Automatically organize extracted information into searchable, structured formats.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supported Formats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Report Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Blood Tests</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">X-Ray Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Prescriptions</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <span className="text-gray-700">Discharge Summaries</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span className="text-gray-700">Lab Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span className="text-gray-700">MRI/CT Scans</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-pink-600" />
              <span className="text-gray-700">Consultation Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <span className="text-gray-700">And More...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to digitize your medical reports?
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your reports in the Health Records section and experience the power of AI-driven OCR processing.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/health-records">
              <Button icon={Upload} className="shadow-lg">
                Upload Reports
              </Button>
            </Link>
            <Link to="/health-records">
              <Button variant="outline" icon={Eye}>
                View Existing Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How OCR Processing Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Upload</h4>
              <p className="text-sm text-gray-600">Upload your medical report (PDF, JPG, PNG)</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Process</h4>
              <p className="text-sm text-gray-600">AI analyzes and extracts text from your document</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Structure</h4>
              <p className="text-sm text-gray-600">Data is organized into searchable categories</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Access</h4>
              <p className="text-sm text-gray-600">View, search, and manage your digital health records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
