# VN-RESQ: Intelligent Emergency Command Center

VN-RESQ is an AI-powered emergency response coordination platform designed to address critical bottlenecks in rescue operations: information overload, misinformation, and lack of real-time visibility.

## 🚀 Overview

The system aggregates multi-modal data (Voice, Vision, Social) into a centralized dashboard, enabling commanders to:
- **Visualize** incidents in real-time on a digital map.
- **Filter** authentic alerts from noise using AI verification.
- **Coordinate** rescue units efficiently based on data-driven insights.

## ✨ Key Features

- **Live Command Map**: Real-time visualization of incidents and rescue units using interactive maps.
- **Smart Alert Feed**: Aggregated stream of emergency alerts classified by source (Voice SOS, Computer Vision, Social Media) and severity.
- **Analytics Dashboard**: Statistical insights into incident trends and resource allocation.
- **AI Simulation**: Built-in simulation engine to generate mock emergency scenarios for training and demonstration.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Leaflet Maps, Recharts.
- **Backend**: Python FastAPI.
- **AI/Data**: Mock integration for Voice/Vision analysis (Simulated).

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/vn-resq.git
    cd vn-resq
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn requests
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start Backend Server**
    ```bash
    # In /backend terminal
    source venv/bin/activate
    uvicorn main:app --reload
    ```

2.  **Start Frontend Client**
    ```bash
    # In /frontend terminal
    npm run dev
    ```
    Access the dashboard at `http://localhost:3000`.

3.  **Run Simulation (Optional)**
    To generate fake alerts:
    ```bash
    # In root directory
    # Ensure backend venv is activated or requests is installed
    python3 simulation.py
    ```

## 🛡️ License

This project is licensed under the MIT License.
