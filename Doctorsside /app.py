from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained model
model_path = "risk_model.pkl"
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print("✅ Model loaded successfully")
else:
    print(f"❌ Model file not found at {model_path}. Please run machine.py first.")
    model = None

# Define expected input data
class PatientData(BaseModel):
    age: int
    cholesterol: float
    blood_pressure: float
    bmi: float
    smoking: int

@app.post("/predict")
async def predict(data: PatientData):
    if model is None:
        return {"error": "Model not loaded", "risk_percentage": 0, "prediction": 0, "success": False}

    try:
        input_data = [[data.age, data.cholesterol, data.blood_pressure, data.bmi, data.smoking]]
        probability = model.predict_proba(input_data)[0][1]
        percent_risk = round(probability * 100, 2)

        return {
            "prediction": probability,
            "risk_percentage": percent_risk,
            "success": True
        }
    except Exception as e:
        return {
            "error": str(e),
            "prediction": 0,
            "risk_percentage": 0,
            "success": False
        }

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "Doctor ML Prediction Service", "port": 8001}

