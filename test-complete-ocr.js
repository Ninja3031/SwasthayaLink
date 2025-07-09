const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test the complete OCR workflow
async function testCompleteOCR() {
  try {
    console.log('🧪 Testing Complete OCR Workflow...');
    
    // Test 1: Check if all services are running
    console.log('\n1. 🔍 Checking services...');
    
    try {
      const doctorBackend = await axios.get('http://localhost:3001/health');
      console.log('✅ Doctor Portal Backend:', doctorBackend.data.status);
    } catch (error) {
      console.log('❌ Doctor Portal Backend not running on port 3001');
      return;
    }
    
    try {
      const ocrService = await axios.get('http://localhost:3002/health');
      console.log('✅ OCR Service:', ocrService.data.status);
    } catch (error) {
      console.log('❌ OCR Service not running on port 3002');
      return;
    }
    
    // Test 2: Upload and process a real file
    console.log('\n2. 📄 Testing file upload and OCR...');
    
    const testFile = '../uploads/1752071850609-file.png';
    if (!fs.existsSync(testFile)) {
      console.log('❌ Test file not found:', testFile);
      return;
    }
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile), {
      filename: 'test-document.png',
      contentType: 'image/png'
    });
    form.append('patientName', 'John Doe');
    form.append('patientId', 'P12345');
    form.append('documentType', 'lab-report');
    
    console.log('📤 Uploading file to Doctor Portal Backend...');
    
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3001/api/ocr/upload', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...form.getHeaders(),
      },
      timeout: 120000, // 2 minutes
    });
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    console.log(`✅ Upload and OCR completed in ${processingTime.toFixed(2)} seconds`);
    
    // Test 3: Analyze the response
    console.log('\n3. 📊 Analyzing OCR results...');
    
    if (response.data && response.data.success) {
      const document = response.data.document;
      const ocr = response.data.ocr;
      
      console.log('📋 Document Details:');
      console.log('  - Title:', document.title);
      console.log('  - Patient:', document.patientName);
      console.log('  - Type:', document.type);
      console.log('  - File Size:', (document.fileSize / 1024 / 1024).toFixed(2), 'MB');
      console.log('  - Status:', document.status);
      
      console.log('\n🔍 OCR Results:');
      console.log('  - Success:', ocr.success);
      console.log('  - Processing Method:', ocr.processingMethod);
      console.log('  - Has Text:', ocr.hasText);
      console.log('  - Text Length:', ocr.text?.length || 0, 'characters');
      console.log('  - Confidence:', ocr.confidence || 'N/A');
      
      if (ocr.text && ocr.text.length > 0) {
        console.log('\n📝 Extracted Text Preview:');
        console.log('---');
        console.log(ocr.text.substring(0, 300) + (ocr.text.length > 300 ? '...' : ''));
        console.log('---');
        
        console.log('\n🎉 SUCCESS! OCR is working perfectly!');
        console.log('✅ File uploaded and stored in:', document.filePath);
        console.log('✅ Text extracted and visible in backend');
        console.log('✅ Ready for frontend integration');
      } else {
        console.log('\n⚠️ No text was extracted from the document');
        console.log('This could be due to:');
        console.log('- Image quality issues');
        console.log('- No readable text in the image');
        console.log('- OCR processing errors');
      }
      
    } else {
      console.log('❌ Upload failed:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCompleteOCR();
