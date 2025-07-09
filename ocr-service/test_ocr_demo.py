#!/usr/bin/env python3
"""
PaddleOCR Demo Script
Tests PaddleOCR functionality with sample images
"""

import os
import sys
import json
from datetime import datetime

def test_paddleocr_installation():
    """Test if PaddleOCR can be imported and initialized"""
    print("=" * 50)
    print("PADDLEOCR INSTALLATION TEST")
    print("=" * 50)
    
    try:
        print("1. Testing PaddleOCR import...")
        from paddleocr import PaddleOCR
        print("   ✅ PaddleOCR imported successfully")
        
        print("2. Initializing PaddleOCR engine...")
        ocr = PaddleOCR(use_textline_orientation=True, lang='en')
        print("   ✅ PaddleOCR engine initialized successfully")
        
        return ocr
        
    except ImportError as e:
        print(f"   ❌ Import Error: {e}")
        print("   💡 Solution: Install PaddleOCR with: pip install paddleocr")
        return None
    except Exception as e:
        print(f"   ❌ Initialization Error: {e}")
        return None

def test_ocr_with_sample_files(ocr_engine):
    """Test OCR with existing uploaded files"""
    print("\n" + "=" * 50)
    print("TESTING OCR WITH UPLOADED FILES")
    print("=" * 50)
    
    # Look for uploaded files in the parent directory
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    
    if not os.path.exists(uploads_dir):
        print(f"❌ Uploads directory not found: {uploads_dir}")
        return
    
    # Get all image files
    image_extensions = ['.png', '.jpg', '.jpeg']
    image_files = []
    
    for file in os.listdir(uploads_dir):
        if any(file.lower().endswith(ext) for ext in image_extensions):
            image_files.append(os.path.join(uploads_dir, file))
    
    if not image_files:
        print("❌ No image files found in uploads directory")
        return
    
    print(f"Found {len(image_files)} image files to test:")
    for i, file_path in enumerate(image_files[:3]):  # Test first 3 files
        print(f"\n{i+1}. Testing file: {os.path.basename(file_path)}")
        test_single_file(ocr_engine, file_path)

def test_single_file(ocr_engine, file_path):
    """Test OCR on a single file"""
    try:
        start_time = datetime.now()
        
        print(f"   📄 Processing: {os.path.basename(file_path)}")
        print(f"   📁 Full path: {file_path}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"   ❌ File not found: {file_path}")
            return
        
        # Run OCR
        result = ocr_engine.predict(file_path)
        
        # Extract text from results
        extracted_text = ""
        confidence_scores = []

        print(f"   🔍 Raw result type: {type(result)}")
        print(f"   🔍 Raw result: {result}")

        # Handle different result formats from PaddleOCR
        if result:
            if isinstance(result, list) and len(result) > 0:
                # New PaddleX format - list with dictionary containing rec_texts and rec_scores
                first_result = result[0]
                if isinstance(first_result, dict) and 'rec_texts' in first_result:
                    extracted_text = " ".join(first_result['rec_texts'])
                    confidence_scores = first_result.get('rec_scores', [])
                # Old format - list of lines
                else:
                    for line in result:
                        if line and isinstance(line, list):
                            for word_info in line:
                                if word_info and len(word_info) >= 2:
                                    text = word_info[1][0]
                                    confidence = word_info[1][1]
                                    extracted_text += text + " "
                                    confidence_scores.append(confidence)
            elif isinstance(result, dict):
                # Dictionary format
                if 'rec_texts' in result:
                    extracted_text = " ".join(result['rec_texts'])
                    confidence_scores = result.get('rec_scores', [])
                elif 'text' in result:
                    extracted_text = result['text']
                    confidence_scores = [result.get('confidence', 0.9)]
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Calculate average confidence
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # Display results
        print(f"   ⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"   📊 Average confidence: {avg_confidence:.2f}")
        print(f"   📝 Extracted text length: {len(extracted_text)} characters")
        
        if extracted_text.strip():
            print(f"   ✅ OCR SUCCESS!")
            print(f"   📄 Extracted text preview:")
            print(f"      {extracted_text[:200]}{'...' if len(extracted_text) > 200 else ''}")
            
            # Try to extract medical data
            medical_data = extract_medical_data(extracted_text)
            if medical_data:
                print(f"   🏥 Medical data extracted:")
                for key, value in medical_data.items():
                    print(f"      {key}: {value}")
        else:
            print(f"   ⚠️  No text extracted from image")
            
    except Exception as e:
        print(f"   ❌ OCR Error: {str(e)}")

def extract_medical_data(text):
    """Extract structured medical data from text using simple keyword matching"""
    import re
    text_lower = text.lower()
    structured_data = {}
    
    # Blood pressure patterns
    bp_pattern = r'(\d{2,3})/(\d{2,3})'
    bp_match = re.search(bp_pattern, text)
    if bp_match:
        structured_data['blood_pressure'] = f"{bp_match.group(1)}/{bp_match.group(2)}"
    
    # Glucose patterns
    glucose_patterns = [
        r'glucose[:\s]*(\d+\.?\d*)\s*mg/dl',
        r'blood sugar[:\s]*(\d+\.?\d*)',
        r'fasting glucose[:\s]*(\d+\.?\d*)'
    ]
    for pattern in glucose_patterns:
        match = re.search(pattern, text_lower)
        if match:
            structured_data['glucose'] = f"{match.group(1)} mg/dL"
            break
    
    # Date patterns
    date_patterns = [
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
        r'(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})'
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            structured_data['date'] = match.group(1)
            break
    
    # Patient name (simple heuristic)
    name_patterns = [
        r'patient[:\s]*([a-zA-Z\s]+)',
        r'name[:\s]*([a-zA-Z\s]+)'
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text_lower)
        if match:
            name = match.group(1).strip().title()
            if len(name) > 2 and len(name) < 50:
                structured_data['patient_name'] = name
            break
    
    return structured_data

def create_test_summary():
    """Create a summary of the test results"""
    print("\n" + "=" * 50)
    print("TEST SUMMARY & NEXT STEPS")
    print("=" * 50)
    
    print("If PaddleOCR is working:")
    print("✅ You should see extracted text from your uploaded images")
    print("✅ The OCR service will automatically use real OCR instead of mock data")
    print("✅ Your health records will show actual extracted text")
    
    print("\nIf PaddleOCR is not working:")
    print("❌ Install dependencies: cd ocr-service && pip install -r requirements.txt")
    print("❌ Check Python version (PaddleOCR requires Python 3.6+)")
    print("❌ Check system dependencies (may need additional packages on some systems)")
    
    print("\nTo enable real OCR in the service:")
    print("1. Make sure this demo works successfully")
    print("2. Restart the OCR service: python app.py")
    print("3. The service will automatically detect PaddleOCR and use it")

if __name__ == "__main__":
    print("🔍 PaddleOCR Demo & Test Script")
    print("This script will test if PaddleOCR is working with your uploaded files\n")
    
    # Test PaddleOCR installation
    ocr_engine = test_paddleocr_installation()
    
    if ocr_engine:
        # Test with sample files
        test_ocr_with_sample_files(ocr_engine)
    
    # Show summary
    create_test_summary()
