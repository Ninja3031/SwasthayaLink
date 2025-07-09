#!/usr/bin/env python3
"""
Create a test image with medical text for OCR testing
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_medical_document():
    # Create a white background image
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a system font, fallback to default if not available
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        font_small = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 14)
    except:
        try:
            font_large = ImageFont.truetype("arial.ttf", 24)
            font_medium = ImageFont.truetype("arial.ttf", 18)
            font_small = ImageFont.truetype("arial.ttf", 14)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Medical document text
    y_position = 50
    
    # Header
    draw.text((50, y_position), "MEDICAL LABORATORY REPORT", fill='black', font=font_large)
    y_position += 50
    
    # Patient info
    draw.text((50, y_position), "Patient Name: John Doe", fill='black', font=font_medium)
    y_position += 30
    draw.text((50, y_position), "Date: January 15, 2024", fill='black', font=font_medium)
    y_position += 30
    draw.text((50, y_position), "Patient ID: P12345", fill='black', font=font_medium)
    y_position += 50
    
    # Test results
    draw.text((50, y_position), "TEST RESULTS:", fill='black', font=font_medium)
    y_position += 40
    
    results = [
        "Hemoglobin: 13.5 g/dL (Normal: 12.0-15.5)",
        "White Blood Cells: 6,800 /µL (Normal: 4,500-11,000)",
        "Platelets: 285,000 /µL (Normal: 150,000-450,000)",
        "Glucose: 95 mg/dL (Normal: 70-100)",
        "Cholesterol: 180 mg/dL (Normal: <200)"
    ]
    
    for result in results:
        draw.text((70, y_position), f"• {result}", fill='black', font=font_small)
        y_position += 25
    
    y_position += 30
    
    # Interpretation
    draw.text((50, y_position), "INTERPRETATION:", fill='black', font=font_medium)
    y_position += 30
    draw.text((50, y_position), "All values within normal limits.", fill='black', font=font_small)
    y_position += 50
    
    # Doctor signature
    draw.text((50, y_position), "Dr. Smith, MD", fill='black', font=font_medium)
    y_position += 25
    draw.text((50, y_position), "City Medical Center", fill='black', font=font_small)
    
    # Save the image
    image.save('test-medical-document.png')
    print("✅ Test medical document created: test-medical-document.png")

if __name__ == "__main__":
    create_test_medical_document()
