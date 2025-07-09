import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib

# Load data
data = pd.read_csv("patients_data.csv")

# Features you want to use
X = data[["age", "cholesterol", "blood_pressure", "bmi", "smoking"]]
y = data["risk_level"]  # 0 or 1

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "risk_model.pkl")
print("✅ Model saved as risk_model.pkl")
