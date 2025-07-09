# 🔍 PaddleOCR Service for Medical Documents

A Node.js service that provides OCR (Optical Character Recognition) capabilities using PaddleOCR for processing medical documents in the doctor portal.

## 🚀 Features

- **Medical Document OCR**: Extract text from medical reports, prescriptions, lab results
- **Multiple Formats**: Support for images (JPEG, PNG, BMP, TIFF) and PDF files
- **High Accuracy**: Uses PaddleOCR for superior text recognition
- **CORS Enabled**: Ready for frontend integration
- **File Upload**: Secure file handling with size limits
- **Mock Mode**: Works without PaddleOCR installation for development

## 📋 Prerequisites

### Required
- Node.js (v14 or higher)
- npm or yarn

### Optional (for actual OCR)
- Python 3.7+
- PaddleOCR
- pdf2image (for PDF support)

## 🛠️ Installation

### 1. Install Node.js Dependencies
```bash
cd ocr-service
npm install
```

### 2. Install PaddleOCR (Optional - for actual OCR)
```bash
# Install Python dependencies
pip install paddleocr
pip install pdf2image

# For PDF support, you may also need:
# Ubuntu/Debian: sudo apt-get install poppler-utils
# macOS: brew install poppler
# Windows: Download poppler and add to PATH
```

## 🚀 Usage

### Start the Service
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3002`

### API Endpoints

#### POST /ocr
Upload and process a document with OCR.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (image or PDF)

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "filename": "document.jpg",
  "message": "OCR processing completed successfully"
}
```

#### GET /health
Check service health status.

**Response:**
```json
{
  "status": "OK",
  "service": "PaddleOCR Service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the ocr-service directory:

```env
PORT=3002
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:5176,http://localhost:5177,http://localhost:3000
```

### File Limits
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, BMP, TIFF, PDF
- Upload directory: `./uploads` (auto-created)

## 🧪 Testing

### Test with curl
```bash
# Upload an image for OCR processing
curl -X POST \
  -F "file=@/path/to/your/document.jpg" \
  http://localhost:3002/ocr

# Check health status
curl http://localhost:3002/health
```

### Test with Frontend
The service is configured to work with the doctor portal frontend. Upload documents through the UI and they will be processed automatically.

## 🔄 Mock Mode vs Real OCR

### Mock Mode (Default)
- Works without PaddleOCR installation
- Returns realistic medical document text samples
- Perfect for development and testing
- No additional dependencies required

### Real OCR Mode
- Requires PaddleOCR installation
- Processes actual document images
- Higher accuracy for real medical documents
- Uncomment the PaddleOCR code in `server.js`

## 📁 Project Structure

```
ocr-service/
├── server.js           # Main Express server
├── paddle_ocr.py       # Python OCR processing script
├── package.json        # Node.js dependencies
├── README.md          # This file
├── uploads/           # Temporary upload directory
└── .env              # Environment configuration
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend URL is in the CORS origins list
   - Check that the service is running on port 3001

2. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file format is supported
   - Ensure uploads directory exists and is writable

3. **PaddleOCR Not Working**
   - Install PaddleOCR: `pip install paddleocr`
   - For PDF support: `pip install pdf2image`
   - Check Python path and dependencies

4. **Service Won't Start**
   - Check if port 3002 is available
   - Verify Node.js version (v14+)
   - Install dependencies: `npm install`

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=ocr-service npm start
```

## 🔒 Security Considerations

- File uploads are validated for type and size
- Uploaded files are automatically cleaned up after processing
- CORS is configured for specific origins only
- No persistent file storage (files deleted after OCR)

## 📈 Performance Tips

- Use GPU acceleration for PaddleOCR if available
- Implement file caching for repeated OCR requests
- Consider image preprocessing for better OCR accuracy
- Monitor memory usage for large PDF files

## 🤝 Integration with Doctor Portal

The service is designed to integrate seamlessly with the doctor portal:

1. **Upload Documents**: Use the "Upload & Extract Text (OCR)" button
2. **Automatic Processing**: Files are sent to this service for OCR
3. **Text Extraction**: Extracted text is displayed in the UI
4. **Document Storage**: Processed documents are saved with OCR text

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Test with the health endpoint first
4. Check server logs for detailed error messages
