#!/usr/bin/env python3
"""
PaddleOCR Integration Script for Medical Document Processing
"""

import sys
import json
import os
from pathlib import Path

try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False
    print("Warning: PaddleOCR not installed. Install with: pip install paddleocr", file=sys.stderr)

def initialize_ocr():
    """Initialize PaddleOCR with optimal settings for medical documents"""
    if not PADDLEOCR_AVAILABLE:
        raise ImportError("PaddleOCR is not installed")
    
    # Initialize with English language and angle classification
    ocr = PaddleOCR(
        use_angle_cls=True,  # Enable angle classification for rotated text
        lang='en',           # English language
        use_gpu=False,       # Set to True if GPU is available
        show_log=False       # Reduce verbose logging
    )
    return ocr

def process_image_ocr(image_path, ocr_instance=None):
    """
    Process an image file with PaddleOCR and extract text
    
    Args:
        image_path (str): Path to the image file
        ocr_instance: Pre-initialized OCR instance (optional)
    
    Returns:
        dict: Contains extracted text and metadata
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    if ocr_instance is None:
        ocr_instance = initialize_ocr()
    
    try:
        # Perform OCR on the image
        result = ocr_instance.ocr(image_path, cls=True)
        
        # Extract text from results
        extracted_text = ""
        confidence_scores = []
        
        if result and len(result) > 0:
            for idx in range(len(result)):
                res = result[idx]
                if res:  # Check if results exist for this page
                    for line in res:
                        if len(line) >= 2:
                            text = line[1][0]  # Extracted text
                            confidence = line[1][1]  # Confidence score
                            
                            extracted_text += text + "\n"
                            confidence_scores.append(confidence)
        
        # Calculate average confidence
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            "success": True,
            "text": extracted_text.strip(),
            "confidence": round(avg_confidence, 3),
            "lines_detected": len(confidence_scores),
            "filename": os.path.basename(image_path)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "filename": os.path.basename(image_path)
        }

def process_pdf_ocr(pdf_path, ocr_instance=None):
    """
    Process a PDF file with PaddleOCR (requires pdf2image)
    
    Args:
        pdf_path (str): Path to the PDF file
        ocr_instance: Pre-initialized OCR instance (optional)
    
    Returns:
        dict: Contains extracted text from all pages
    """
    try:
        from pdf2image import convert_from_path
        PDF2IMAGE_AVAILABLE = True
    except ImportError:
        PDF2IMAGE_AVAILABLE = False
        return {
            "success": False,
            "error": "pdf2image not installed. Install with: pip install pdf2image",
            "text": ""
        }
    
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    if ocr_instance is None:
        ocr_instance = initialize_ocr()
    
    try:
        # Convert PDF to images
        images = convert_from_path(pdf_path)
        
        all_text = ""
        total_confidence = 0
        total_lines = 0
        
        for page_num, image in enumerate(images, 1):
            # Save temporary image
            temp_image_path = f"temp_page_{page_num}.png"
            image.save(temp_image_path, 'PNG')
            
            try:
                # Process each page
                result = process_image_ocr(temp_image_path, ocr_instance)
                
                if result["success"]:
                    all_text += f"\n--- Page {page_num} ---\n"
                    all_text += result["text"] + "\n"
                    total_confidence += result["confidence"] * result["lines_detected"]
                    total_lines += result["lines_detected"]
                
            finally:
                # Clean up temporary image
                if os.path.exists(temp_image_path):
                    os.remove(temp_image_path)
        
        avg_confidence = total_confidence / total_lines if total_lines > 0 else 0
        
        return {
            "success": True,
            "text": all_text.strip(),
            "confidence": round(avg_confidence, 3),
            "pages_processed": len(images),
            "lines_detected": total_lines,
            "filename": os.path.basename(pdf_path)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "filename": os.path.basename(pdf_path)
        }

def main():
    """Main function for command-line usage"""
    if len(sys.argv) != 2:
        print("Usage: python paddle_ocr.py <image_or_pdf_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not PADDLEOCR_AVAILABLE:
        # Return mock data for demonstration
        mock_result = {
            "success": True,
            "text": f"MOCK OCR RESULT\nProcessed file: {os.path.basename(file_path)}\nDate: {os.path.getctime(file_path)}\n\nThis is a demonstration of OCR text extraction.\nInstall PaddleOCR for actual text recognition.",
            "confidence": 0.95,
            "lines_detected": 4,
            "filename": os.path.basename(file_path),
            "note": "Mock result - PaddleOCR not installed"
        }
        print(json.dumps(mock_result))
        return
    
    try:
        # Initialize OCR
        ocr = initialize_ocr()
        
        # Determine file type and process accordingly
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.pdf':
            result = process_pdf_ocr(file_path, ocr)
        else:
            result = process_image_ocr(file_path, ocr)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "text": "",
            "filename": os.path.basename(file_path) if os.path.exists(file_path) else "unknown"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
