# VN-ResQ: AI-Powered Emergency Response & Dispatch System

VN-ResQ is a modern, real-time emergency management platform designed to streamline the lifecycle of incident response—from reporting to dispatch and resolution. It leverages Generative AI (Google Gemini) for intelligent information extraction and provides a robust SDK for seamless integration with field units.

## 🚀 Key Features

### 1. Intelligent Incident Reporting
-   **AI extraction**: Automatically parses unstructured text or audio reports (hotline/messenger) to identify **Location**, **Urgency**, **Incident Type**, and **People Count** using Google Gemini.
-   **Smart Geocoding**: enhanced localized geocoding logic (OpenStreetMap/Nominatim) optimized for Vietnam addresses (specifically Hanoi), handling "fuzzy" addresses effectively.

### 2. Real-Time Command Dashboard
-   **Live Map**: Visualizes active incidents and team locations on an interactive Leaflet map.
-   **Dispatch Control**: One-click dispatching of nearest available teams.
-   **Live Tracking**: Real-time status updates (Pending, En Route, On Site, Resolved) from field units.

### 3. Field Unit Operations (Team App)
-   **Mission Management**: Teams receive real-time assignments via the **VN-ResQ SDK**.
-   **Status Updates**: Teams can Accept, Reject, update status (En Route, On Site), and Report Completion.
-   **Backup Request**: One-click distress signal to request backup units.

### 4. Developer SDK & External Integration
-   **Type-Safe SDK**: A fully typed TypeScript SDK (`vn-resq-sdk`) covering Incidents, Teams, Mapping, and Resources.
-   **External Demo**: Includes a standalone `external-demo` app simulating 3rd-party integration.
-   **Security**: Role-based access control with API Keys (Admin, Viewer, Team Specific).

## 🛠️ Technology Stack

-   **Backend**: Node.js, Express, TypeScript, Prisma ORM.
-   **Frontend**: React, Vite, TailwindCSS, Lucide Icons.
-   **Maps**: Leaflet, OpenStreetMap.
-   **AI**: Google Gemini Pro (Text/Multimodal extraction).
-   **Database**: SQLite (Dev) / PostgreSQL (Ready).
-   **Tools**: `concurrently` for mono-repo management.

## 📦 Project Structure

```bash
VN-ResQ/
├── backend/          # Express API & Business Logic
├── frontend/         # React Dispatch Dashboard & Team App Interface
├── sdk/              # Shared TypeScript SDK library
├── external-demo/    # Standalone app demonstrating SDK usage
└── README.md
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- NPM
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/vn-resq.git
    cd VN-ResQ
    ```

2.  **Install Dependencies (Root & Sub-projects):**
    ```bash
    npm install
    npm install --prefix backend
    npm install --prefix frontend
    npm install --prefix sdk
    npm install --prefix external-demo
    ```

3.  **Build the SDK:**
    The frontend and demo apps depend on the local SDK build.
    ```bash
    cd sdk
    npm run build
    cd ..
    ```

4.  **Environment Setup:**
    Create a `.env` file in `backend/`:
    ```env
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="your_gemini_key_here"
    PORT=3000
    ```

5.  **Database Setup:**
    ```bash
    cd backend
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
    ```

### Running the Application

**Development Mode (All-in-One):**
Use the root script to launch Backend (3000) and Frontend (5173) simultaneously.
```bash
npm run dev
```

**Running External SDK Demo:**
To test the SDK in isolation:
```bash
cd external-demo
npm run dev
```
(Access at http://localhost:5175)

## 🔑 Demo Credentials

**API Keys (Role Based):**
-   **Admin**: `ADMIN_SECRET` (Full Access)
-   **Viewer**: `VIEWER_SECRET` (Read Only)
-   **Team Alpha**: `TEAM_ALPHA_KEY`
-   **Team Bravo**: `TEAM_BRAVO_KEY`

## 📸 Usage Flow

1.  **Report**: Send a request via API or use the `external-demo` to simulate an SOS signal (e.g., "Fire at 36 Dai Co Viet").
2.  **Dispatch**: Open the Dashboard (`http://localhost:5173`). See the incident appear with AI-verified location. Click "Dispatch".
3.  **Response**: Switch to the **Mission SDK Page** (Team App) or the simulated external app. "Accept" the mission.
4.  **Resolve**: Update status to "En Route" -> "On Site" -> "Mission Complete". The incident clears from the dashboard.