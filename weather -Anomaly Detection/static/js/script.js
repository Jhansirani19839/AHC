document.addEventListener("DOMContentLoaded", () => {
    const cityBtns = document.querySelectorAll(".city-btn");
    const loading = document.getElementById("loading");
    const status = document.getElementById("status");

    // Live city buttons
    cityBtns.forEach(btn => {
        btn.addEventListener("click", async () => {
            // UI
            cityBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loading.style.display = "block";
            status.textContent = `Loading ${btn.dataset.city}...`;
            status.className = "status";

            try {
                const res = await fetch(`/api/live/${btn.dataset.city}`);
                const data = await res.json();

                if (data.error) {
                    status.textContent = "Error: " + data.error;
                    status.className = "status anomaly";
                    return;
                }

                // Fill telemetry
                document.getElementById("temp").textContent = data.temperature;
                document.getElementById("humidity").textContent = data.humidity;
                document.getElementById("wind").textContent = data.wind_speed;
                document.getElementById("condition").textContent = data.condition;
                document.getElementById("prediction").textContent = data.prediction;
                document.getElementById("score").textContent = data.anomaly_score;

                // Status color
                if (data.prediction.includes("ANOMALY")) {
                    status.textContent = "⚠️ ANOMALY DETECTED";
                    status.className = "status anomaly";
                } else {
                    status.textContent = "✅ Weather is NORMAL";
                    status.className = "status normal";
                }
            } catch (err) {
                status.textContent = "Network error";
                status.className = "status anomaly";
            } finally {
                loading.style.display = "none";
            }
        });
    });

    // Demo simulation
    document.getElementById("run-sim").addEventListener("click", async () => {
        const temp = document.getElementById("sim-temp").value;
        const humidity = document.getElementById("sim-humidity").value;
        const wind = document.getElementById("sim-wind").value;
        const simStatus = document.getElementById("sim-status");

        simStatus.textContent = "Running AI simulation...";
        simStatus.className = "status";

        try {
            const res = await fetch("/api/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperature: temp,
                    humidity: humidity,
                    wind_speed: wind
                })
            });

            const data = await res.json();

            document.getElementById("sim-prediction").textContent = data.prediction;
            document.getElementById("sim-score").textContent = data.anomaly_score;

            if (data.prediction.includes("ANOMALY")) {
                simStatus.textContent = "⚠️ ANOMALY DETECTED (Sensor fault / Extreme values)";
                simStatus.className = "status anomaly";
            } else {
                simStatus.textContent = "✅ NORMAL reading";
                simStatus.className = "status normal";
            }
        } catch (err) {
            simStatus.textContent = "Simulation failed";
            simStatus.className = "status anomaly";
        }
    });
});