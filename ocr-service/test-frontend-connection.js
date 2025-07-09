const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test the OCR service exactly like the frontend does
async function testFrontendConnection() {
  try {
    console.log('🧪 Testing OCR Service from Frontend Perspective...');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:3002/health', {
        timeout: 5000
      });
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (healthError) {
      console.error('❌ Health check failed:', healthError.message);
      return;
    }
    
    // Test 2: OCR endpoint with 2-minute timeout (like frontend)
    console.log('2. Testing OCR endpoint with 2-minute timeout...');
    
    if (!fs.existsSync('./test-medical-document.png')) {
      console.log('❌ Test image not found. Please run: python3 create-test-image.py');
      return;
    }
    
    const form = new FormData();
    form.append('file', fs.createReadStream('./test-medical-document.png'), {
      filename: 'test-medical-document.png',
      contentType: 'image/png'
    });
    
    const startTime = Date.now();
    
    try {
      const ocrResponse = await axios.post('http://localhost:3002/ocr', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...form.getHeaders(),
        },
        timeout: 120000, // 2 minutes like frontend
      });
      
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      console.log('✅ OCR test passed!');
      console.log(`⏱️ Processing time: ${processingTime.toFixed(2)} seconds`);
      console.log('📄 Response:', {
        success: ocrResponse.data.success,
        hasText: ocrResponse.data.hasText,
        textLength: ocrResponse.data.text?.length || 0,
        processingMethod: ocrResponse.data.processingMethod,
        filename: ocrResponse.data.filename
      });
      
      if (ocrResponse.data.text) {
        console.log('📝 Extracted text preview:', ocrResponse.data.text.substring(0, 200) + '...');
      }
      
    } catch (ocrError) {
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      console.error('❌ OCR test failed after', processingTime.toFixed(2), 'seconds');
      console.error('Error code:', ocrError.code);
      console.error('Error message:', ocrError.message);
      
      if (ocrError.response) {
        console.error('Response status:', ocrError.response.status);
        console.error('Response data:', ocrError.response.data);
      }
      
      return;
    }
    
    console.log('🎉 All tests passed! OCR service is working correctly from frontend perspective.');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testFrontendConnection();
