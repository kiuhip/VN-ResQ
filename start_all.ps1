$host.ui.RawUI.WindowTitle = "VN-ResQ Launcher"

Write-Host "Starting VN-ResQ System..." -ForegroundColor Green

# Kill existing node processes (optional, but good for cleanup, might be aggressive)
# Stop-Process -Name "node" -ErrorAction SilentlyContinue

# Start Backend
Write-Host "Launching Backend (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd backend; npm run dev}"

# Start Frontend
Write-Host "Launching Frontend (Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd frontend; npm run dev}"

# Start External Demo
Write-Host "Launching External Demo (Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {cd external-demo; npm run dev}"

Write-Host "All services have been triggered." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173 (usually)"
Write-Host "External Demo: http://localhost:5174 (usually)"
