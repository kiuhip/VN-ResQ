#!/bin/bash
# Kill any existing processes on ports 8000 and 3000
echo "Cleaning up ports 8000 and 3000..."
lsof -t -i:8000 -i:3000 | xargs kill -9 2>/dev/null

echo "Starting VN-ResQ System..."

# Start Backend
echo "Starting Backend on port 8000..."
cd backend
# Ensure dependencies are installed (quietly)
python3 -m pip install -q -r requirements.txt
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Systems started."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Access User Site: http://localhost:3000/user"
echo "Access Rescue Dashboard: http://localhost:3000/rescue/dashboard"
echo "Access API Docs: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
