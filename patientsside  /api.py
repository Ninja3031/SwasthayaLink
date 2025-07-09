from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware

# Load model
model = joblib.load("patient_fasting_model.pkl")

# Create FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 For local testing, allow all. Later restrict, e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input data structure
class PatientData(BaseModel):
    age: int
    bmi: float
    cholesterol: float
    prev_fasting: float
    bp: float
    smoking: int

# Endpoint to get prediction
@app.post("/predict")
def predict(data: PatientData):
    input_df = [[
        data.age,
        data.bmi,
        data.cholesterol,
        data.prev_fasting,
        data.bp,
        data.smoking
    ]]
    prediction = model.predict(input_df)
    return {"predicted_future_fasting": prediction[0]}