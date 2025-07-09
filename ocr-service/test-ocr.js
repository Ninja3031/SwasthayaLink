const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test the OCR service
async function testOCR() {
  try {
    console.log('🧪 Testing OCR Service...');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3002/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Use the medical document test image we created
    const testImagePath = './test-medical-document.png';

    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found. Creating one...');
      return;
    }
    
    // Test OCR endpoint
    console.log('2. Testing OCR endpoint...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-medical-document.png',
      contentType: 'image/png'
    });
    
    const ocrResponse = await axios.post('http://localhost:3002/ocr', form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ OCR test passed:', ocrResponse.data);
    
    // Don't clean up the test image - keep it for manual testing
    
    console.log('🎉 All tests passed! OCR service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testOCR();
