# Transit Delay Prediction — Python Backend

## Requirements
- Python 3.10+
- pip

## Setup & Run

```bash
# 1. Create virtual environment (from the project root)
cd backend
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health & model accuracy |
| POST | `/predict` | Predict delay for given conditions |
| GET | `/stats` | Full dataset statistics |
| GET | `/routes` | Per-route delay metrics |
| GET | `/metadata` | Available transport types, weather, events, etc. |

## Model Details

Two Gradient Boosting models are trained on startup from `Dataset/public_transport_delays.csv`:

- **Classifier** → predicts `delayed` (0/1) + delay probability  
- **Regressor** → predicts `actual_arrival_delay_min`

**Input features used:**
`transport_type`, `weather_condition`, `temperature_C`, `humidity_percent`,
`wind_speed_kmh`, `precipitation_mm`, `event_type`, `traffic_congestion_index`,
`peak_hour`, `season`, `holiday`, `weekday`, `hour`
