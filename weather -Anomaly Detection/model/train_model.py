import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Load data
df = pd.read_csv("../data/weather_data.csv")

# Features
features = ["temperature", "humidity", "wind_speed"]
X = df[features]

# Scale the data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Isolation Forest (unsupervised anomaly detection)
# contamination = expected percentage of anomalies
model = IsolationForest(
    n_estimators=200,
    contamination=0.15,
    random_state=42,
    max_samples="auto"
)
model.fit(X_scaled)

# Save model + scaler together
os.makedirs(".", exist_ok=True)
joblib.dump({"model": model, "scaler": scaler}, "anomaly_model.pkl")

print("✅ Model trained and saved as anomaly_model.pkl")
print(f"Training samples: {len(X)}")
print(f"Anomaly rate in training data: {(df['label'] == 1).mean():.2%}")