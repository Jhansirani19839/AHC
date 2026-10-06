from flask import Flask, render_template, request, jsonify
import requests
import joblib
import numpy as np
import os

app = Flask(__name__)

# ========== CONFIG ==========
# Get free API key from: https://openweathermap.org/api
OPENWEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY_HERE"   # ← Replace this

# City coordinates (Tamil Nadu)
CITIES = {
    "Chennai":  {"lat": 13.0827, "lon": 80.2707},
    "Ooty":     {"lat": 11.4102, "lon": 76.6950},
    "Madurai":  {"lat": 9.9252,  "lon": 78.1198},
    "Erode":    {"lat": 11.3410, "lon": 77.7172},
    "Namakkal": {"lat": 11.2189, "lon": 78.1674}
}

# Load model
MODEL_PATH = os.path.join("model", "anomaly_model.pkl")
model_data = None

def load_model():
    global model_data
    if os.path.exists(MODEL_PATH):
        model_data = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully")
    else:
        print("❌ Model not found! Run train_model.py first")

load_model()

def predict_anomaly(temp, humidity, wind):
    if model_data is None:
        return "Model not loaded", 0.0

    scaler = model_data["scaler"]
    model = model_data["model"]

    X = np.array([[temp, humidity, wind]])
    X_scaled = scaler.transform(X)

    # IsolationForest: -1 = anomaly, 1 = normal
    pred = model.predict(X_scaled)[0]
    score = model.decision_function(X_scaled)[0]  # higher = more normal

    # Convert score to 0-100 anomaly score (higher = more anomalous)
    anomaly_score = max(0, min(100, (0.5 - score) * 100))

    if pred == -1:
        return "ANOMALY DETECTED", round(anomaly_score, 2)
    else:
        return "NORMAL", round(anomaly_score, 2)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/api/live/<city>")
def live_weather(city):
    if city not in CITIES:
        return jsonify({"error": "City not supported"}), 400

    lat = CITIES[city]["lat"]
    lon = CITIES[city]["lon"]

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"

    try:
        res = requests.get(url, timeout=8)
        data = res.json()

        if res.status_code != 200:
            return jsonify({"error": data.get("message", "API error")}), 500

        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind = data["wind"]["speed"]
        condition = data["weather"][0]["description"].title()

        prediction, score = predict_anomaly(temp, humidity, wind)

        return jsonify({
            "city": city,
            "temperature": round(temp, 1),
            "humidity": humidity,
            "wind_speed": round(wind, 1),
            "condition": condition,
            "prediction": prediction,
            "anomaly_score": score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/simulate", methods=["POST"])
def simulate():
    data = request.json
    try:
        temp = float(data["temperature"])
        humidity = float(data["humidity"])
        wind = float(data["wind_speed"])
    except:
        return jsonify({"error": "Invalid input"}), 400

    prediction, score = predict_anomaly(temp, humidity, wind)

    return jsonify({
        "prediction": prediction,
        "anomaly_score": score
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)