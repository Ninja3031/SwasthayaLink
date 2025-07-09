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
    
    # Initialize with basic compatible parameters
    ocr = PaddleOCR(
        use_textline_orientation=True,  # Enable text orientation detection
        lang='en'                       # English language
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
        # Perform OCR on the image using the new predict method
        result = ocr_instance.predict(image_path)
        
        # Extract text from results (handle new PaddleOCR format)
        extracted_text = ""
        confidence_scores = []

        if result:
            # Handle new PaddleOCR format with predict method
            if isinstance(result, list) and len(result) > 0:
                first_result = result[0]
                if isinstance(first_result, dict):
                    # New format: dictionary with rec_texts and rec_scores
                    if 'rec_texts' in first_result:
                        extracted_text = "\n".join(first_result['rec_texts'])
                        confidence_scores = first_result.get('rec_scores', [])
                    elif 'text' in first_result:
                        extracted_text = first_result['text']
                        confidence_scores = [first_result.get('confidence', 0.9)]
                else:
                    # Old format: list of detection results
                    for page_result in result:
                        if page_result:
                            for line in page_result:
                                if len(line) >= 2:
                                    text = line[1][0]  # Extracted text
                                    confidence = line[1][1]  # Confidence score

                                    extracted_text += text + "\n"
                                    confidence_scores.append(confidence)
            elif isinstance(result, dict):
                # Direct dictionary result
                if 'rec_texts' in result:
                    extracted_text = "\n".join(result['rec_texts'])
                    confidence_scores = result.get('rec_scores', [])
                elif 'text' in result:
                    extracted_text = result['text']
                    confidence_scores = [result.get('confidence', 0.9)]
        
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
