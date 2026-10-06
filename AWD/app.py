from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os
import pandas as pd

app = Flask(__name__)

# Train aani save panna model-ah load pannrom
model_path = os.path.join(os.path.dirname(__file__), 'model/anomaly_model.pkl')
if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_weather():
    global model
    if model is None:
        return jsonify({'error': 'Model not found. Please train model first.'}), 500
    
    data = request.get_json()
    try:
        temp = float(data.get('temperature', 0))
        humidity = float(data.get('humidity', 0))
        wind_speed = float(data.get('wind_speed', 0))
        rainfall = float(data.get('rainfall', 0))
        air_pressure = float(data.get('air_pressure', 1013))
        
        # Features array for prediction
        features = np.array([[temp, humidity, wind_speed, rainfall, air_pressure]])
        
        # Isolation Forest prediction: 1 for normal, -1 for anomaly
        prediction = model.predict(features)[0]
        
        status = "Normal" if prediction == 1 else "Anomaly"
        
        return jsonify({
            'status': status,
            'message': 'Reading is normal compared with historical patterns.' if status == 'Normal' else 'Anomaly Detected: This weather-station reading is unusual compared with the learned pattern.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    # Sample historical data for dashboard/charts
    history = [
        {"time": "9 AM", "date": "2026-09-16", "temperature": 28.5, "humidity": 65.0, "wind_speed": 12.0, "rainfall": 0.0, "air_pressure": 1012.0, "status": "Normal"},
        {"time": "11 AM", "date": "2026-09-16", "temperature": 30.4, "humidity": 60.1, "wind_speed": 14.2, "rainfall": 0.2, "air_pressure": 1010.5, "status": "Normal"},
        {"time": "1 PM", "date": "2026-09-16", "temperature": 32.2, "humidity": 55.4, "wind_speed": 8.0, "rainfall": 0.0, "air_pressure": 1012.2, "status": "Normal"},
        {"time": "3 PM", "date": "2026-09-16", "temperature": 92.0, "humidity": 30.0, "wind_speed": 45.0, "rainfall": 15.0, "air_pressure": 985.0, "status": "Anomaly"},
        {"time": "5 PM", "date": "2026-09-16", "temperature": 29.0, "humidity": 62.0, "wind_speed": 11.0, "rainfall": 0.0, "air_pressure": 1011.5, "status": "Normal"}
    ]
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True, port=5000)