import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

def train_weather_model():
    # CSV file path check pannrom
    data_path = os.path.join(os.path.dirname(__file__), '../data/weather_data.csv')
    df = pd.read_csv(data_path)
    
    # Features for anomaly detection
    features = ['temperature', 'humidity', 'wind_speed', 'rainfall', 'air_pressure']
    X = df[features]
    
    # Isolation Forest model initialize pannrom
    # contamination='auto' or small percentage like 0.05 can be used
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X)
    
    # Model folder create pannrom
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), 'anomaly_model.pkl')
    
    # Trained model-ah save pannrom
    joblib.dump(model, model_path)
    print(f"Model successfully trained and saved to {model_path}")

if __name__ == '__main__':
    train_weather_model()