import api from './api';

export interface ReportUploadResponse {
  message: string;
  report: {
    id: string;
    user: string;
    filePath: string;
    fileType: string;
    ocrResult: any;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Report {
  id: string;
  user: string;
  filePath: string;
  fileType: string;
  ocrResult: any;
  createdAt: string;
  updatedAt: string;
}

export const reportService = {
  // Upload a new report file
  uploadReport: async (file: File): Promise<ReportUploadResponse> => {
    const formData = new FormData();
    formData.append('report', file);

    const response = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all reports for current user
  getReports: async (): Promise<Report[]> => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Get a specific report by ID
  getReport: async (id: string): Promise<Report> => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Delete a report
  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  // Get OCR result for a report
  getOCRResult: async (id: string): Promise<any> => {
    const response = await api.get(`/reports/${id}/ocr`);
    return response.data;
  },
};
