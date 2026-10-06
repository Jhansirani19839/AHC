# AI/ML-Based Intelligent Anomaly Detection for Automatic Weather Stations (AWS)

## Project Architecture
Weather Data -> Flask Backend -> AI/ML Anomaly Detection (Isolation Forest) -> Normal / Anomaly Result -> Web Dashboard

## Step-by-Step Instructions to Run Locally:

1. **Create Folders**:
   Make sure you have the exact folder structure:
   ```text
   weather-anomaly-system/
   ├── app.py
   ├── requirements.txt
   ├── model/ (train_model.py, anomaly_model.pkl)
   ├── data/ (weather_data.csv)
   ├── templates/ (index.html, dashboard.html)
   └── static/ (css/style.css, js/script.js)