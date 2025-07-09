const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the OCR service with real uploaded files
async function testRealUploads() {
  try {
    console.log('🧪 Testing OCR Service with Real Uploaded Files...');
    
    // Test files from uploads directory
    const testFiles = [
      '../uploads/1752071850609-file.png',
      '../uploads/1752008534938-file.png',
      '../uploads/1752007219809-file.png'
    ];
    
    for (const filePath of testFiles) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        continue;
      }
      
      const filename = path.basename(filePath);
      console.log(`\n📄 Testing OCR with: ${filename}`);
      
      try {
        // Method 1: File upload (like doctor portal)
        console.log('  🔄 Testing file upload method...');
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
          filename: filename,
          contentType: 'image/png'
        });
        
        const startTime = Date.now();
        
        const response = await axios.post('http://localhost:3002/ocr', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...form.getHeaders(),
          },
          timeout: 120000, // 2 minutes
        });
        
        const endTime = Date.now();
        const processingTime = (endTime - startTime) / 1000;
        
        console.log(`  ✅ Success! Processing time: ${processingTime.toFixed(2)}s`);
        console.log(`  📊 Method: ${response.data.processingMethod}`);
        console.log(`  📝 Text length: ${response.data.text?.length || 0} characters`);
        console.log(`  🎯 Has text: ${response.data.hasText}`);
        
        if (response.data.text && response.data.text.length > 0) {
          console.log(`  📖 Preview: ${response.data.text.substring(0, 100)}...`);
        }
        
        // Method 2: FilePath method (like patient portal)
        console.log('  🔄 Testing filePath method...');
        const filePathResponse = await axios.post('http://localhost:3002/ocr', {
          filePath: filePath
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        });
        
        console.log(`  ✅ FilePath method also works!`);
        console.log(`  📊 Method: ${filePathResponse.data.processingMethod}`);
        
      } catch (error) {
        console.error(`  ❌ Failed to process ${filename}:`, error.message);
        if (error.response) {
          console.error(`  📄 Response status: ${error.response.status}`);
          console.error(`  📄 Response data:`, error.response.data);
        }
      }
    }
    
    console.log('\n🎉 Real upload testing completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testRealUploads();
