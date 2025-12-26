import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { IncidentForm } from "./pages/IncidentForm";
import { Dashboard } from "./pages/Dashboard";
import { ShieldAlert } from "lucide-react";
import SdkDemo from "./pages/SdkDemo"; 
import MissionSdkPage from "./pages/MissionSdkPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IncidentForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sdk-demo" element={<SdkDemo />} />
        <Route path="/missions-sdk" element={<MissionSdkPage />} />

        {/* Navigation Wrapper for verifying/demoing both */}
        <Route
          path="*"
          element={
            <div className="h-screen flex items-center justify-center text-white bg-gray-900 flex-col gap-4">
              <ShieldAlert size={64} className="text-red-500" />
              <h1 className="text-4xl font-bold">VN-ResQ</h1>
              <div className="flex gap-4 mt-8">
                <Link
                  to="/"
                  className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-500"
                >
                  Report Incident
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500"
                >
                  Dispatcher Dashboard
                </Link>
                <Link
                  to="/sdk-demo"
                  className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500"
                >
                  SDK Demo
                </Link>
                <Link
                  to="/missions-sdk"
                  className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500"
                >
                  Missions SDK
                </Link>

              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
