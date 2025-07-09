from fastapi import FastAPI
from pydantic import BaseModel
import joblib
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained model
model = joblib.load("risk_model.pkl")

# Define expected input data
class PatientData(BaseModel):
    age: int
    cholesterol: float
    blood_pressure: float
    bmi: float
    smoking: int

@app.post("/predict")
async def predict(data: PatientData):
    input_data = [[data.age, data.cholesterol, data.blood_pressure, data.bmi, data.smoking]]
    prediction = model.predict(input_data)
    return {"prediction": int(prediction[0])}