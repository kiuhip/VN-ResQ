import requests
import time
import random
import json

API_URL = "http://localhost:8000/api/alerts"

LOCATIONS = [
    {"name": "Tay Ho, Hanoi", "lat": 21.05, "lng": 105.82},
    {"name": "Dong Da, Hanoi", "lat": 21.01, "lng": 105.82},
    {"name": "Hai Ba Trung, Hanoi", "lat": 21.00, "lng": 105.85},
    {"name": "Long Bien, Hanoi", "lat": 21.03, "lng": 105.89},
]

TYPES = ["SOS Voice", "Vision AI", "Social"]
STATUSES = ["Critical", "High", "Medium"]

def generate_alert():
    loc = random.choice(LOCATIONS)
    alert_type = random.choice(TYPES)
    
    desc = ""
    if alert_type == "SOS Voice":
        desc = "Panic detected. Keywords: 'Help', 'Water rising'."
    elif alert_type == "Vision AI":
        desc = "Person detected on rooftop. Confidence: 88%."
    else:
        desc = "Social media report: 'Flooding at intersection...'"

    payload = {
        "type": alert_type,
        "location": loc["name"],
        "status": random.choice(STATUSES),
        "description": desc,
        "lat": loc["lat"] + random.uniform(-0.01, 0.01),
        "lng": loc["lng"] + random.uniform(-0.01, 0.01)
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"Created alert: {payload['type']} at {payload['location']}")
        else:
            print(f"Failed to create alert: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting simulation...")
    while True:
        generate_alert()
        time.sleep(10)
