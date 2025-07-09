import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Load data
data = pd.read_csv("patient_data.csv")

# Features (main is prev_fasting)
X = data[["age", "bmi", "cholesterol", "prev_fasting", "bp", "smoking"]]
y = data["future_fasting"]

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "patient_fasting_model.pkl")
print("✅ Model saved as patient_fasting_model.pkl")
