import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib

# Load data
data = pd.read_csv("patients_data.csv")

# Features and label
X = data[["age", "cholesterol", "blood_pressure", "bmi", "smoking"]]
y = data["risk_level"]

# Train model
model = LogisticRegression()
model.fit(X, y)

# Save
joblib.dump(model, "risk_model.pkl")
print("✅ Model saved as risk_model.pkl")
