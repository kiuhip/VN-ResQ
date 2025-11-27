1. Start the Backend
Open a terminal in the backend directory and run:


# Activate virtual environment
source venv/bin/activate
# Run the server
uvicorn main:app --reload

The API will be available at http://localhost:8000. You can view the interactive API docs at http://localhost:8000/docs to test the new endpoints.

2. Start the Frontend
Open a terminal in the frontend directory and run:

npm run dev

The application will be available at http://localhost:3000.

3. Verify Features
Dashboard: Check that "Rescue Units" shows a count (e.g., "2/3").
Analytics: Navigate to /analytics and verify the charts are displayed.
Settings: Navigate to /settings and verify the configuration options.
Alerts: Check that alerts now have more details (if new alerts are created via API).