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
    
    // Create a simple test image (base64 encoded)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // Save test image
    fs.writeFileSync('./test-image.png', testImageBuffer);
    
    // Test OCR endpoint
    console.log('2. Testing OCR endpoint...');
    const form = new FormData();
    form.append('file', fs.createReadStream('./test-image.png'), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const ocrResponse = await axios.post('http://localhost:3002/ocr', form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ OCR test passed:', ocrResponse.data);
    
    // Clean up
    fs.unlinkSync('./test-image.png');
    
    console.log('🎉 All tests passed! OCR service is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testOCR();
