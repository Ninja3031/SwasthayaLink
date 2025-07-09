#!/usr/bin/env python3
"""
Simple OCR Microservice using PaddleOCR
Runs on port 3001 and processes medical reports
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Try to initialize PaddleOCR
OCR_AVAILABLE = False
ocr_engine = None

try:
    from paddleocr import PaddleOCR
    ocr_engine = PaddleOCR(use_textline_orientation=True, lang='en')
    OCR_AVAILABLE = True
    logger.info("PaddleOCR initialized successfully")
except ImportError as e:
    logger.warning(f"PaddleOCR not available: {e}")
    logger.info("Using mock OCR service (install paddleocr to enable real OCR)")
except Exception as e:
    logger.error(f"Failed to initialize PaddleOCR: {e}")
    logger.info("Using mock OCR service")

def mock_ocr_processing(file_path):
    """Mock OCR processing for when PaddleOCR is not available"""
    logger.info(f"Running mock OCR processing for: {file_path}")
    return {
        "success": True,
        "extractedText": "Mock OCR Result: This is a sample medical report. Patient: John Doe. Blood Pressure: 120/80. Glucose: 95 mg/dL. Date: 2024-01-15.",
        "structuredData": {
            "patient_name": "John Doe",
            "blood_pressure": "120/80",
            "glucose": "95 mg/dL",
            "date": "2024-01-15"
        },
        "confidence": 0.85,
        "processing_time": 0.5,
        "mock": True
    }

def process_with_paddleocr(file_path):
    """Process image with PaddleOCR"""
    try:
        start_time = datetime.now()
        
        # Run OCR
        result = ocr_engine.predict(file_path)
        
        # Extract text from results
        extracted_text = ""
        confidence_scores = []

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
        
        # Calculate average confidence
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        # Basic medical data extraction (simple keyword matching)
        structured_data = extract_medical_data(extracted_text)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "extractedText": extracted_text.strip(),
            "structuredData": structured_data,
            "confidence": avg_confidence,
            "processing_time": processing_time,
            "mock": False
        }
        
    except Exception as e:
        logger.error(f"PaddleOCR processing failed: {str(e)}")
        return {
            "success": False,
            "error": f"OCR processing failed: {str(e)}",
            "mock": False
        }

def extract_medical_data(text):
    """Extract structured medical data from text using simple keyword matching"""
    text_lower = text.lower()
    structured_data = {}
    
    # Blood pressure patterns
    import re
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "OCR Microservice",
        "port": 3001,
        "ocr_available": OCR_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/ocr', methods=['POST'])
def process_ocr():
    """Main OCR processing endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'filePath' not in data:
            return jsonify({
                "success": False,
                "error": "Missing filePath in request"
            }), 400
        
        file_path = data['filePath']
        logger.info(f"Processing OCR for file: {file_path}")

        # Handle relative paths - the uploads folder is in the parent directory
        if not os.path.isabs(file_path):
            # Convert relative path to absolute path
            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(parent_dir, file_path)
            logger.info(f"Converted to absolute path: {file_path}")

        # Check if file exists
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({
                "success": False,
                "error": f"File not found: {file_path}"
            }), 404
        
        # Process with appropriate OCR method
        if OCR_AVAILABLE:
            result = process_with_paddleocr(file_path)
        else:
            result = mock_ocr_processing(file_path)
        
        logger.info(f"OCR processing completed for {file_path}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"OCR processing error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    logger.info("Starting OCR Microservice on port 3001...")
    logger.info(f"PaddleOCR available: {OCR_AVAILABLE}")
    app.run(host='0.0.0.0', port=3001, debug=True)
