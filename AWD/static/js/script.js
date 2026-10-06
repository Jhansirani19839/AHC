document.addEventListener('DOMContentLoaded', () => {
    // Load live/historical readings on dashboard load
    loadHistoricalData();

    const form =أت = document.getElementById('demo-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                temperature: parseFloat(document.getElementById('temp').value),
                humidity: parseFloat(document.getElementById('humidity').value),
                wind_speed: parseFloat(document.getElementById('wind').value),
                rainfall: parseFloat(document.getElementById('rain').value),
                air_pressure: parseFloat(document.getElementById('pressure').value)
            };

            const resultBox = document.getElementById('result-box');
            resultBox.style.display = 'block';
            resultBox.className = 'result-box';
            resultBox.innerHTML = 'Analyzing with AI Model...';

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.status === 'Normal') {
                        resultBox.classList.add('result-normal');
                        resultBox.innerHTML = `🟢 <strong>NORMAL</strong><br>${data.message}`;
                    } else {
                        resultBox.classList.add('result-anomaly');
                        resultBox.innerHTML = `🔴 <strong>ANOMALY DETECTED</strong><br>${data.message}`;
                    }
                } else {
                    resultBox.classList.add('result-anomaly');
                    resultBox.innerHTML = `Error: ${data.error}`;
                }
            } catch (err) {
                resultBox.classList.add('result-anomaly');
                resultBox.innerHTML = `Connection Error: ${err.message}`;
            }
        });
    }
});

async function loadHistoricalData() {
    try {
        const res = await fetch('/api/historical');
        const data = await res.json();
        
        const tbody = document.getElementById('historical-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            const badgeClass = row.status === 'Normal' ? 'badge-normal' : 'badge-anomaly';
            tr.innerHTML = `
                <td>${row.time}</td>
                <td>${row.temperature}°C</td>
                <td>${row.humidity}%</td>
                <td>${row.wind_speed} km/h</td>
                <td>${row.rainfall} mm</td>
                <td><span class="${badgeClass}">${row.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error('Failed to load historical data', e);
    }
}