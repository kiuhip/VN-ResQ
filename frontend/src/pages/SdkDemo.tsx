import { useState, useEffect } from "react";
import {
  ResQClient,
  IncidentsSDK,
  MissionsSDK,
  MissionStatus,
} from "vn-resq-sdk";

const SdkDemo = () => {
  // Config
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/api");
  const [apiKey, setApiKey] = useState("demo-key");
  const [incidentsSdk, setIncidentsSdk] = useState<IncidentsSDK | null>(null);
  const [missionsSdk, setMissionsSdk] = useState<MissionsSDK | null>(null);

  // Inputs
  const [incidentText, setIncidentText] = useState(
    "Cháy lớn tại Đại học Bách Khoa Hà Nội.Nhiều sinh viên bị kẹt."
  );
  const [missionStatusId, setMissionStatusId] = useState("");

  // Output
  const [response, setResponse] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const c = new ResQClient({ baseUrl, apiKey });
    setIncidentsSdk(new IncidentsSDK(c));
    setMissionsSdk(new MissionsSDK(c));
  }, [baseUrl, apiKey]);

  const addLog = (msg: string) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleCreateIncident = async () => {
    if (!incidentsSdk) return;
    try {
      addLog("Creating incident...");
      const res = await incidentsSdk.create({
        text: incidentText,
        source: "web-sdk-demo",
      });
      setResponse(res);
      addLog(`✅ Created Incident: ${res.id}`);
    } catch (e: any) {
      setResponse({ error: e.message, details: e.details });
      addLog(`❌ Error: ${e.message}`);
    }
  };

  const handleListIncidents = async () => {
    if (!incidentsSdk) return;
    try {
      addLog("Listing incidents...");
      const res = await incidentsSdk.list({ status: "open" });
      setResponse(res);
      addLog(`✅ Found ${res.length} incidents`);
    } catch (e: any) {
      setResponse({ error: e.message });
    }
  };

  const handleAssignMission = async () => {
    const sdk = missionsSdk;
    if (!sdk) return;

    if (!response?.id) {
      // Hack: use incident ID from previous response if available
      // Find an incident id
      addLog(
        "⚠️ Please select create incident first or list incidents to copy an ID. Using manual ID if not present."
      );
      const incidentId = response?.id || prompt("Enter Incident ID");
      if (!incidentId) return;

      try {
        addLog(`Assigning mission for incident ${incidentId}...`);
        const res = await sdk.assign({ incidentId, auto: true });
        setResponse(res);
        setMissionStatusId(res.id);
        if (res.status === "pending") {
          addLog(
            `⏳ Mission Pending: Waiting for team ${
              (res as any).assignedTeamId
            } to accept...`
          );
        } else {
          addLog(
            `✅ Assigned Mission: ${res.id} to Team ${
              (res as any).assignedTeamId
            }`
          );
        }
      } catch (e: any) {
        setResponse({ error: e.message });
        addLog(`❌ Error: ${e.message}`);
      }
      return;
    }

    // Default flow if response is incident
    try {
      addLog(`Assigning mission for incident ${response.id}...`);
      const res = await sdk.assign({
        incidentId: response.id,
        auto: true,
      });
      setResponse(res);
      setMissionStatusId(res.id);
      if (res.status === "pending") {
        addLog(
          `⏳ Mission Pending: Waiting for team ${
            (res as any).assignedTeamId
          } to accept...`
        );
      } else {
        addLog(
          `✅ Assigned Mission: ${res.id} to Team ${
            (res as any).assignedTeamId
          }`
        );
      }
    } catch (e: any) {
      setResponse({ error: e.message });
      addLog(`❌ Error: ${e.message}`);
    }
  };

  const handleUpdateMission = async () => {
    if (!missionsSdk || !missionStatusId) {
      const id = prompt("Enter Mission ID") || "";
      setMissionStatusId(id);
      if (!id) return;
    }
    try {
      addLog(`Updating Mission ${missionStatusId} to EN_ROUTE...`);
      const res = await missionsSdk!.updateStatus(missionStatusId, {
        status: MissionStatus.EN_ROUTE,
        location: { lat: 21.0, lng: 105.8 },
        note: "Moving out via SDK",
      });
      setResponse(res);
      addLog(`✅ Verify Status: ${res.status}`);
    } catch (e: any) {
      setResponse({ error: e.message });
      addLog(`❌ Error: ${e.message}`);
    }
  };

  const handleRunScenario = async () => {
    if (!incidentsSdk || !missionsSdk) return;
    setLogs([]);
    addLog("🚀 Starting Full Rescue Scenario...");

    try {
      // 1. Create Incident
      // 1. Create Incident
      addLog("1️⃣ Creating Incident: 'Cháy tại ĐH Bách Khoa'");
      const incident = await incidentsSdk.create({
        text: "Cháy lớn tại Đại học Bách Khoa Hà Nội.Nhiều sinh viên bị kẹt.",
        source: "scenario-runner",
      });
      setResponse(incident);
      addLog(`   ✅ Incident Created: ${incident.id}`);
      await new Promise((r) => setTimeout(r, 800));

      // 2. Auto Assign
      addLog("2️⃣ Dispatching: Auto Assigning Team...");
      const mission = await missionsSdk.assign({
        incidentId: incident.id,
        auto: true,
      });
      setResponse(mission);
      setMissionStatusId(mission.id);
      addLog(`   ⏳ Mission Pending: Waiting for team to ACCEPT...`);

      // 🕒 Wait for Mission Response (Interactive Demo)
      let currentMission = mission;
      let attempts = 0;
      while (currentMission.status === "pending" && attempts < 30) {
        // Wait up to 60 seconds
        await new Promise((r) => setTimeout(r, 2000));
        currentMission = await missionsSdk.getMission(mission.id);
        setResponse(currentMission);
        attempts++;

        if (currentMission.status === "cancelled") {
          throw new Error("Mission was REJECTED by the rescue team.");
        }
      }

      if (currentMission.status === "pending") {
        throw new Error("Timeout: No team accepted the mission in time.");
      }

      addLog(`   ✅ Team Accepted! Proceeding with mission logic...`);
      await new Promise((r) => setTimeout(r, 1000));

      // 3. En Route (Gần HUST)
      addLog("3️⃣ Update Status: EN_ROUTE");
      const enRoute = await missionsSdk.updateStatus(mission.id, {
        status: MissionStatus.EN_ROUTE,
        location: { lat: 21.015, lng: 105.845 },
        note: "Đang di chuyển khẩn cấp qua ngã tư Lê Thanh Nghị",
      });
      setResponse(enRoute);
      addLog(`   ✅ Status: ${enRoute.status}`);
      await new Promise((r) => setTimeout(r, 800));

      // 4. On Site (Tại Bách Khoa)
      addLog("4️⃣ Update Status: ON_SITE");
      const onSite = await missionsSdk.updateStatus(mission.id, {
        status: MissionStatus.ON_SITE,
        location: { lat: 21.0073, lng: 105.843 },
        note: "Đã có mặt tại sảnh C1, triển khai cứu hỏa.",
      });
      setResponse(onSite);
      addLog(`   ✅ Status: ${onSite.status}`);
      await new Promise((r) => setTimeout(r, 800));

      // 5. Report & Resolve
      addLog("5️⃣ Report & Resolve");
      const report = await missionsSdk.report(mission.id, {
        rescuedCount: 3,
        needs: ["Medical Evac"],
      });
      // Also set status to resolved if report doesn't do it automatically (based on backend logic)
      // SDK doesn't forbid double updates.
      const resolved = await missionsSdk.updateStatus(mission.id, {
        status: MissionStatus.RESOLVED,
      });

      setResponse({ report, finalStatus: resolved.status });
      addLog("🏁 Scenario Completed Successfully!");
    } catch (e: any) {
      setResponse({ error: e.message });
      addLog(`❌ Scenario Failed: ${e.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-green-400 font-mono p-4">
      {/* Control Panel */}
      <div className="w-1/3 border-r border-green-800 pr-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          VN-ResQ SDK Playground
        </h1>

        <div className="p-4 rounded border-2 border-green-500 bg-green-900/20">
          <h2 className="text-lg font-bold text-green-400 mb-2">
            📢 DEMO MODE
          </h2>
          <p className="text-xs text-green-300 mb-4">
            Run a full end-to-end rescue scenario to demonstrate SDK
            capabilities in real-time.
          </p>
          <button
            onClick={handleRunScenario}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded shadow-lg shadow-green-900/50 transition-all"
          >
            ▶ RUN LIVE SCENARIO
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded border border-green-900">
          <h2 className="text-sm text-green-500 mb-2">CONFIGURATION</h2>
          <input
            className="w-full bg-black border border-green-700 p-2 mb-2 rounded text-white"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="API URL"
          />
          <input
            className="w-full bg-black border border-green-700 p-2 rounded text-white"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            type="password"
          />
        </div>

        <div className="bg-gray-800 p-4 rounded border border-green-900 flex-1 overflow-auto">
          <h2 className="text-sm text-green-500 mb-4">MANUAL OPERATIONS</h2>

          <div className="mb-6">
            <label className="block text-xs mb-1 text-gray-400">
              INCIDENT REPORT
            </label>
            <textarea
              className="w-full bg-black border border-green-700 p-2 rounded text-white text-sm h-20 mb-2"
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateIncident}
                className="flex-1 bg-green-900 hover:bg-green-800 text-white p-2 rounded border border-green-700"
              >
                POST /incidents
              </button>
              <button
                onClick={handleListIncidents}
                className="flex-1 border border-green-700 hover:bg-green-900 text-green-400 p-2 rounded"
              >
                GET List
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs mb-1 text-gray-400">DISPATCH</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleAssignMission}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-blue-200 border border-blue-700 p-2 rounded"
              >
                Auto Assign
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-black border border-blue-900 p-2 rounded text-white text-sm"
                placeholder="Mission ID"
                value={missionStatusId}
                onChange={(e) => setMissionStatusId(e.target.value)}
              />
              <button
                onClick={handleUpdateMission}
                className="flex-1 border border-blue-700 hover:bg-blue-900 text-blue-400 p-2 rounded"
              >
                PATCH Status
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm text-gray-500 mb-2">CONSOLE LOGS</h2>
            <div className="text-xs text-gray-400 bg-black p-2 rounded h-40 overflow-y-auto font-mono">
              {logs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="w-2/3 pl-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl text-white">Response Viewer</h2>
          {response && !response.error && (
            <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
              200 OK
            </span>
          )}
          {response?.error && (
            <span className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs">
              ERROR
            </span>
          )}
        </div>
        <div className="flex-1 bg-black border border-green-900 rounded p-4 overflow-auto relative group">
          <pre className="text-sm text-green-300">
            {JSON.stringify(response, null, 2)}
          </pre>
          {!response && (
            <div className="text-gray-600 italic mt-10 text-center">
              Execute an operation to see data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SdkDemo;
