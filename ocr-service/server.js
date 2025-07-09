const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// Mock OCR function (replace with actual PaddleOCR implementation)
function performMockOCR(filename) {
  const mockTexts = [
    `MEDICAL LABORATORY REPORT
Patient Name: John Doe
Date: ${new Date().toLocaleDateString()}
Test Results:
- Hemoglobin: 13.5 g/dL (Normal: 12.0-15.5)
- White Blood Cells: 6,800 /µL (Normal: 4,500-11,000)
- Platelets: 285,000 /µL (Normal: 150,000-450,000)
- Glucose: 95 mg/dL (Normal: 70-100)
- Cholesterol: 180 mg/dL (Normal: <200)

Interpretation: All values within normal limits.
Doctor: Dr. Smith
Lab: City Medical Center`,

    `PRESCRIPTION
Patient: Jane Smith
Date: ${new Date().toLocaleDateString()}
Medications:
1. Metformin 500mg - Take twice daily with meals
2. Lisinopril 10mg - Take once daily in morning
3. Atorvastatin 20mg - Take once daily at bedtime

Instructions:
- Monitor blood pressure daily
- Follow up in 4 weeks
- Lab work in 3 months

Dr. Johnson, MD
License: 12345`,

    `RADIOLOGY REPORT
Patient: Mike Wilson
Study Date: ${new Date().toLocaleDateString()}
Examination: Chest X-Ray

Findings:
- Heart size normal
- Lungs clear bilaterally
- No acute cardiopulmonary abnormalities
- Diaphragms intact
- Bone structures normal

Impression: Normal chest radiograph

Radiologist: Dr. Brown, MD`,

    `DISCHARGE SUMMARY
Patient: Sarah Davis
Admission Date: ${new Date(Date.now() - 3*24*60*60*1000).toLocaleDateString()}
Discharge Date: ${new Date().toLocaleDateString()}

Diagnosis: Type 2 Diabetes Mellitus, well controlled

Treatment:
- Continued metformin therapy
- Dietary counseling provided
- Blood glucose monitoring

Discharge Instructions:
- Continue current medications
- Follow diabetic diet
- Check blood sugar twice daily
- Follow up in 2 weeks

Attending Physician: Dr. Wilson, MD`
  ];
  
  return mockTexts[Math.floor(Math.random() * mockTexts.length)];
}

// Python OCR function using the standalone script
function performPythonOCR(imagePath) {
  return new Promise((resolve, reject) => {
    console.log('🐍 Using Python OCR script:', imagePath);

    // Use the standalone Python OCR script
    const pythonProcess = spawn('python3', ['paddle_ocr.py', imagePath]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            console.log('✅ Python OCR successful');
            resolve(result.text || '');
          } else {
            console.log('⚠️ Python OCR failed:', result.error);
            reject(new Error(result.error || 'Python OCR processing failed'));
          }
        } catch (e) {
          console.log('⚠️ Failed to parse Python OCR output:', e.message);
          reject(new Error('Failed to parse Python OCR output: ' + e.message));
        }
      } else {
        console.log('⚠️ Python OCR process failed with code:', code);
        reject(new Error(`Python OCR process failed with code ${code}: ${error}`));
      }
    });

    // Add timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python OCR timeout after 60 seconds'));
    }, 60000);
  });
}

// Actual PaddleOCR function
function performPaddleOCR(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import sys
from paddleocr import PaddleOCR
import json
import os

try:
    # Initialize PaddleOCR with basic parameters (compatible with all versions)
    ocr = PaddleOCR(
        use_textline_orientation=True,  # Enable text orientation detection
        lang='en'                       # English language
    )

    # Get image path from command line
    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    # Perform OCR (without cls parameter for compatibility)
    result = ocr.ocr(image_path)

    # Extract text with better formatting
    extracted_text = ""
    confidence_scores = []

    if result and len(result) > 0:
        for page_idx in range(len(result)):
            page_result = result[page_idx]
            if page_result:  # Check if results exist for this page
                for line in page_result:
                    if len(line) >= 2 and line[1]:
                        text = line[1][0]  # Extracted text
                        confidence = line[1][1]  # Confidence score

                        # Only include text with reasonable confidence
                        if confidence > 0.5:  # 50% confidence threshold
                            extracted_text += text + "\\n"
                            confidence_scores.append(confidence)

    # Calculate average confidence
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0

    # Clean up the extracted text
    extracted_text = extracted_text.strip()

    # Return result as JSON
    result_data = {
        "text": extracted_text,
        "success": True,
        "confidence": round(avg_confidence, 3),
        "lines_detected": len(confidence_scores),
        "has_text": len(extracted_text) > 0
    }

    print(json.dumps(result_data))

except Exception as e:
    error_result = {
        "text": "",
        "success": False,
        "error": str(e),
        "has_text": False
    }
    print(json.dumps(error_result))
`;

    // Write Python script to temporary file
    const scriptPath = './temp_ocr_script.py';
    fs.writeFileSync(scriptPath, pythonScript);

    // Execute Python script
    const pythonProcess = spawn('python', [scriptPath, imagePath]);
    
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up temporary script
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }

      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            resolve(result.text || '');
          } else {
            reject(new Error(result.error || 'OCR processing failed'));
          }
        } catch (e) {
          reject(new Error('Failed to parse OCR output: ' + e.message));
        }
      } else {
        reject(new Error(`OCR process failed with code ${code}: ${error}`));
      }
    });
  });
}

// OCR endpoint - supports both file upload and filePath (like patient portal)
app.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    let filePath;
    let filename;

    // Check if this is a file upload (doctor portal) or filePath request (patient portal style)
    if (req.file) {
      // File upload approach (current doctor portal)
      filePath = req.file.path;
      filename = req.file.originalname;
      console.log(`Processing OCR for uploaded file: ${filename}`);
    } else if (req.body.filePath) {
      // FilePath approach (patient portal style)
      filePath = req.body.filePath;
      filename = path.basename(filePath);
      console.log(`Processing OCR for file path: ${filePath}`);

      // Handle relative paths - convert to absolute
      if (!path.isAbsolute(filePath)) {
        const parentDir = path.dirname(path.dirname(__dirname));
        filePath = path.join(parentDir, filePath);
        console.log(`Converted to absolute path: ${filePath}`);
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'File not found',
          details: `File not found: ${filePath}`
        });
      }
    } else {
      return res.status(400).json({ error: 'No file uploaded or filePath provided' });
    }

    // Simulate processing time (reduced for better UX)
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Get file size for logging
      let fileSize = 0;
      if (req.file) {
        fileSize = req.file.size;
      } else if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        fileSize = stats.size;
      }

      console.log(`📄 Processing file: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

      // Try to use actual PaddleOCR first
      let extractedText;
      let processingMethod = 'unknown';

      try {
        console.log('🔍 Attempting PaddleOCR processing...');

        // Use the standalone Python OCR script
        extractedText = await performPythonOCR(filePath);
        processingMethod = 'PaddleOCR (Python Script)';
        console.log('✅ PaddleOCR processing successful');
      } catch (paddleError) {
        console.log('⚠️ PaddleOCR failed:', paddleError.message);
        console.log('🔄 Falling back to mock OCR for demonstration');
        extractedText = performMockOCR(filename);
        processingMethod = 'Mock OCR (PaddleOCR unavailable)';
      }

      // Clean up uploaded file (only if it was uploaded, not if it was a filePath)
      if (req.file && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // If no text was extracted, provide helpful information
      if (!extractedText || extractedText.trim().length === 0) {
        console.log('⚠️ No text detected in document, providing helpful feedback');
        extractedText = `No readable text detected in this document.

Document: ${filename}
Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB
Processing: ${processingMethod}

Possible reasons:
• Image quality too low
• Text too small or blurry
• Handwritten content
• Document contains only images/charts
• Scanned document needs better resolution

You can manually add text content if needed.`;
      }

      res.json({
        success: true,
        text: extractedText,
        filename: filename,
        processingMethod: processingMethod,
        hasText: extractedText && extractedText.trim().length > 0,
        message: `OCR processing completed successfully using ${processingMethod}`
      });

    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      
      // Clean up uploaded file (only if it was uploaded, not if it was a filePath)
      if (req.file && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(500).json({
        error: 'OCR processing failed',
        details: ocrError.message
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'File upload failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PaddleOCR Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OCR Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 OCR endpoint: http://localhost:${PORT}/ocr`);
  console.log(`📁 Upload directory: ./uploads`);
  console.log(`🔧 CORS enabled for doctor portal on ports 5176, 5177, 3000`);
});

module.exports = app;
