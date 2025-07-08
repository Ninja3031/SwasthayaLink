import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import {
  Share2,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings,
  AlertTriangle,
  Users,
  Building,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { mockUserSettings, mockCurrentUser } from '../data/mockData';
import { DataSharingSettings, ConsentLog } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const UHIIntegration: React.FC = () => {
  const [dataSharing, setDataSharing] = useLocalStorage<DataSharingSettings>('dataSharing', mockUserSettings.dataSharing);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentLog | null>(null);
  const [newConsentForm, setNewConsentForm] = useState({
    entityName: '',
    entityType: 'doctor' as 'doctor' | 'hospital' | 'pharmacy' | 'lab',
    dataTypes: [] as string[],
    duration: '1year',
  });

  const handleToggleUHI = () => {
    setDataSharing({
      ...dataSharing,
      uhiIntegration: !dataSharing.uhiIntegration,
    });
  };

  const handleToggleSharing = (type: keyof Omit<DataSharingSettings, 'consentLogs' | 'uhiIntegration'>) => {
    setDataSharing({
      ...dataSharing,
      [type]: !dataSharing[type],
    });
  };

  const handleGrantConsent = () => {
    if (newConsentForm.entityName && newConsentForm.dataTypes.length > 0) {
      const expiresAt = newConsentForm.duration === 'permanent' ? undefined : 
        new Date(Date.now() + (newConsentForm.duration === '1year' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

      const newConsent: ConsentLog = {
        id: Date.now().toString(),
        entityName: newConsentForm.entityName,
        entityType: newConsentForm.entityType,
        dataTypes: newConsentForm.dataTypes,
        grantedAt: new Date().toISOString(),
        expiresAt,
        status: 'active',
      };

      setDataSharing({
        ...dataSharing,
        consentLogs: [newConsent, ...dataSharing.consentLogs],
      });

      setIsConsentModalOpen(false);
      setNewConsentForm({
        entityName: '',
        entityType: 'doctor',
        dataTypes: [],
        duration: '1year',
      });
    }
  };

  const handleRevokeConsent = () => {
    if (selectedConsent) {
      const updatedConsents = dataSharing.consentLogs.map(consent =>
        consent.id === selectedConsent.id
          ? { ...consent, status: 'revoked' as const }
          : consent
      );
      setDataSharing({
        ...dataSharing,
        consentLogs: updatedConsents,
      });
      setIsRevokeModalOpen(false);
      setSelectedConsent(null);
    }
  };

  const openRevokeModal = (consent: ConsentLog) => {
    setSelectedConsent(consent);
    setIsRevokeModalOpen(true);
  };

  const handleDataTypeToggle = (dataType: string) => {
    const updatedTypes = newConsentForm.dataTypes.includes(dataType)
      ? newConsentForm.dataTypes.filter(type => type !== dataType)
      : [...newConsentForm.dataTypes, dataType];
    
    setNewConsentForm({
      ...newConsentForm,
      dataTypes: updatedTypes,
    });
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return <Stethoscope className="h-5 w-5 text-blue-500" />;
      case 'hospital':
        return <Building className="h-5 w-5 text-green-500" />;
      case 'pharmacy':
        return <Pill className="h-5 w-5 text-purple-500" />;
      case 'lab':
        return <Settings className="h-5 w-5 text-orange-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeConsents = dataSharing.consentLogs.filter(c => c.status === 'active').length;
  const revokedConsents = dataSharing.consentLogs.filter(c => c.status === 'revoked').length;
  const expiredConsents = dataSharing.consentLogs.filter(c => c.status === 'expired').length;

  const dataTypeOptions = [
    'health_records',
    'glucose_readings',
    'vital_signs',
    'medications',
    'appointments',
    'lab_results',
    'prescriptions',
    'exercise_data',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UHI Integration</h1>
          <p className="text-gray-600">Manage your Universal Health Interface connections and data sharing</p>
        </div>
        <Button
          onClick={() => setIsConsentModalOpen(true)}
          icon={Share2}
          className="shadow-lg"
        >
          Grant New Consent
        </Button>
      </div>

      {/* UHI Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Universal Health Interface (UHI)</h3>
                <p className="text-gray-700">
                  ABHA ID: <span className="font-mono font-medium">{mockCurrentUser.abhaId}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {dataSharing.uhiIntegration 
                    ? 'Connected and sharing data securely with authorized healthcare providers'
                    : 'Not connected to UHI network'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                dataSharing.uhiIntegration ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {dataSharing.uhiIntegration ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {dataSharing.uhiIntegration ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button
                onClick={handleToggleUHI}
                variant={dataSharing.uhiIntegration ? 'danger' : 'secondary'}
                size="sm"
              >
                {dataSharing.uhiIntegration ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Consents</p>
                <p className="text-2xl font-bold text-green-600">{activeConsents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revoked Consents</p>
                <p className="text-2xl font-bold text-red-600">{revokedConsents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired Consents</p>
                <p className="text-2xl font-bold text-gray-600">{expiredConsents}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entities</p>
                <p className="text-2xl font-bold text-blue-600">{dataSharing.consentLogs.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sharing Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Sharing Preferences</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Share with Doctors</h4>
                <p className="text-sm text-gray-500">Allow authorized doctors to access your health data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSharing.shareWithDoctors}
                  onChange={() => handleToggleSharing('shareWithDoctors')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Share with Hospitals</h4>
                <p className="text-sm text-gray-500">Allow hospitals to access your health records during visits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSharing.shareWithHospitals}
                  onChange={() => handleToggleSharing('shareWithHospitals')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Share with Pharmacies</h4>
                <p className="text-sm text-gray-500">Allow pharmacies to access prescription information</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSharing.shareWithPharmacies}
                  onChange={() => handleToggleSharing('shareWithPharmacies')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Sharing Consents</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataSharing.consentLogs.map((consent) => (
              <div key={consent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getEntityIcon(consent.entityType)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{consent.entityName}</h4>
                    <p className="text-xs text-gray-600 capitalize">{consent.entityType}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                        {consent.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {consent.dataTypes.length} data types
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right text-xs text-gray-500">
                    <p>Granted: {new Date(consent.grantedAt).toLocaleDateString()}</p>
                    {consent.expiresAt && (
                      <p>Expires: {new Date(consent.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  {consent.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRevokeModal(consent)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {dataSharing.consentLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No data sharing consents granted yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grant Consent Modal */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        title="Grant Data Sharing Consent"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Only grant consent to trusted healthcare providers. You can revoke access at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Entity Name *</label>
              <input
                type="text"
                value={newConsentForm.entityName}
                onChange={(e) => setNewConsentForm({ ...newConsentForm, entityName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Dr. Smith, Apollo Hospital"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Entity Type *</label>
              <select
                value={newConsentForm.entityType}
                onChange={(e) => setNewConsentForm({ ...newConsentForm, entityType: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="doctor">Doctor</option>
                <option value="hospital">Hospital</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="lab">Laboratory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Data Types to Share *</label>
            <div className="grid grid-cols-2 gap-3">
              {dataTypeOptions.map((dataType) => (
                <label key={dataType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newConsentForm.dataTypes.includes(dataType)}
                    onChange={() => handleDataTypeToggle(dataType)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {dataType.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Consent Duration</label>
            <select
              value={newConsentForm.duration}
              onChange={(e) => setNewConsentForm({ ...newConsentForm, duration: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="1month">1 Month</option>
              <option value="1year">1 Year</option>
              <option value="permanent">Permanent (until revoked)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsConsentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantConsent}>Grant Consent</Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Consent Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Data Sharing Consent"
      >
        {selectedConsent && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Confirm Revocation</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Are you sure you want to revoke data sharing consent for {selectedConsent.entityName}? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Consent Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Entity:</span> {selectedConsent.entityName}</p>
                <p><span className="font-medium">Type:</span> {selectedConsent.entityType}</p>
                <p><span className="font-medium">Data Types:</span> {selectedConsent.dataTypes.join(', ')}</p>
                <p><span className="font-medium">Granted:</span> {new Date(selectedConsent.grantedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsRevokeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRevokeConsent}>
                Revoke Consent
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};