import { useState, useEffect } from "react";
import { ResQClient, MissionsSDK } from "vn-resq-sdk";
import {
  CheckCircle,
  XCircle,
  Truck,
  Map,
  Siren,
  Radio,
  Loader2,
} from "lucide-react";

// Mock Key Mapping
const TEAM_KEYS: Record<string, string> = {
  team_alpha: "TEAM_ALPHA_KEY",
  team_bravo: "TEAM_BRAVO_KEY",
  team_charlie: "TEAM_CHARLIE_KEY",
  team_delta: "TEAM_DELTA_KEY",
};

const MissionSdkPage = () => {
  // Config
  const [teamId, setTeamId] = useState("team_alpha"); // Default Identity
  const [missionsSdk, setMissionsSdk] = useState<MissionsSDK | null>(null);

  // State
  const [pendingAssignment, setPendingAssignment] = useState<any>(null);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  // Removed unused statusNote state

  // NOTE: In real app, these come from ENV or Auth Context
  const baseUrl = "http://localhost:3000/api";

  // Dynamic API Key based on selected team
  const apiKey = TEAM_KEYS[teamId] || "INVALID_KEY";

  useEffect(() => {
    const c = new ResQClient({ baseUrl, apiKey });
    setMissionsSdk(new MissionsSDK(c));
  }, [apiKey]); // Re-init when team/key changes

  const addLog = (msg: string) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  // Polling for Pending Requests & Active Mission Status
  useEffect(() => {
    if (!teamId) return;
    const poll = async () => {
      try {
        // 1. Sync Active Mission Status
        const resActive = await fetch(
          `${baseUrl}/missions/active?teamId=${teamId}`
        );
        const activeData = await resActive.json();

        if (activeData && activeData.id) {
          // Update local state if status changed or newly assigned
          if (
            !activeAssignment ||
            activeAssignment.status !== activeData.status
          ) {
            setActiveAssignment(activeData);
            addLog(`🔄 Mission Status: ${activeData.status.toUpperCase()}`);
          }
        } else if (activeAssignment) {
          // Remote mission resolved or cancelled, clear local state
          setActiveAssignment(null);
          addLog("🏁 Mission cleared from system.");
        }

        // 2. Check for Pending Offers
        // Note: Using direct fetch as we modified backend listOffers to return pending
        const res = await fetch(`${baseUrl}/missions/offers?teamId=${teamId}`);
        const data = await res.json();

        // If we have a pending one (and no active one explicitly tracked yet or just switch focus)
        if (data.length > 0) {
          const latest = data[0];
          // Only set if not already processing same ID to avoid flickering
          if (
            pendingAssignment?.id !== latest.id &&
            activeAssignment?.id !== latest.id
          ) {
            setPendingAssignment(latest);
            addLog(
              `🔔 New Request Received: Incident ${latest.incident.locationText}`
            );
            // Play sound?
          }
        } else {
          if (pendingAssignment) setPendingAssignment(null);
        }
      } catch (e) {
        console.error("Poll Error", e);
      }
    };

    poll(); // Run immediately
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [teamId, pendingAssignment, activeAssignment]);

  const handleAction = async (action: string) => {
    if (!missionsSdk) return;

    try {
      if (action === "accept" && pendingAssignment) {
        addLog(`✅ Accepting Assignment...`);
        const res = await missionsSdk.accept(pendingAssignment.id);
        setActiveAssignment(res);
        setPendingAssignment(null);
        addLog(`🚀 Mission Started! Status: ${res.status}`);
      } else if (action === "reject" && pendingAssignment) {
        addLog(`❌ Rejecting Assignment...`);
        await missionsSdk.reject(pendingAssignment.id, "Team Busy");
        setPendingAssignment(null);
        addLog(`🚫 Assignment Rejected.`);
      } else if (activeAssignment) {
        // Active Mission Actions
        let status = "";
        if (action === "en_route") status = "en_route";
        else if (action === "on_site") status = "on_site";
        else if (action === "resolved") {
          await missionsSdk.report(activeAssignment.id, {});
          status = "resolved";
        } else if (action === "backup") {
          addLog("⚠️ Sending Urgent Backup Request...");
          try {
            const res = await fetch(
              `${baseUrl}/missions/${activeAssignment.id}/backup`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              }
            );
            const data = await res.json();
            if (data.backupTeam) {
              addLog(
                `✅ Backup Requested! Team ${data.backupTeam} is pending.`
              );
            } else {
              addLog(`❌ Could not find additional backup teams.`);
            }
          } catch (e) {
            addLog("❌ Failed to send backup signal.");
          }
          return;
        }

        if (status) {
          const res = await missionsSdk.updateStatus(activeAssignment.id, {
            status,
          } as any); // Cast for simplicity
          setActiveAssignment(res);
          addLog(`🔄 Status Updated: ${status.toUpperCase()}`);
          if (status === "resolved") {
            setTimeout(() => setActiveAssignment(null), 2000); // Clear after 2s
          }
        }
      }
    } catch (e: any) {
      addLog(`❌ Error: ${e.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar / Identity */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-blue-500 flex items-center gap-2">
          <Truck /> TEAM APP
        </h1>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Select Identity
          </label>
          {[
            {
              id: "team_alpha",
              name: "Team Alpha",
              type: "Headquarters",
              icon: Map,
            }, // Changed mock
            {
              id: "team_bravo",
              name: "Team Bravo",
              type: "Water Rescue",
              icon: Truck,
            },
            {
              id: "team_charlie",
              name: "Team Charlie",
              type: "Medical",
              icon: Siren,
            },
            { id: "team_delta", name: "Team Delta", type: "Fire", icon: Radio },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTeamId(t.id);
                setPendingAssignment(null);
                setActiveAssignment(null);
                setLogs([]);
              }}
              className={`text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${teamId === t.id
                ? "bg-blue-900/30 border-blue-500 text-blue-200"
                : "bg-slate-800 border-transparent text-slate-400 hover:bg-slate-800/80 hover:border-slate-600"
                }`}
            >
              <div
                className={`p-2 rounded-full ${teamId === t.id ? "bg-blue-600 text-white" : "bg-slate-700"
                  }`}
              >
                <t.icon size={16} />
              </div>
              <div>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-[10px] opacity-70 uppercase">{t.type}</div>
              </div>
              {teamId === t.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto text-xs font-mono text-slate-500 border-t border-slate-800 pt-2">
          {logs.map((l, i) => (
            <div key={i} className="mb-1">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-slate-900">
        {/* CASE 1: Incoming Request */}
        {pendingAssignment && !activeAssignment && (
          <div className="w-full max-w-2xl bg-slate-800 rounded-xl border border-blue-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-600 p-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <Siren className="animate-pulse" /> NEW MISSION REQUEST
              </h2>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    Location
                  </label>
                  <p className="text-xl text-white font-semibold">
                    {pendingAssignment.incident?.locationText ||
                      "Unknown Location"}
                  </p>
                </div>
                <div className="text-right">
                  <label className="text-xs text-slate-400 uppercase font-bold">
                    Urgency
                  </label>
                  <p
                    className={`text-xl font-bold ${pendingAssignment.incident?.urgency === "critical"
                      ? "text-red-500"
                      : "text-yellow-400"
                      }`}
                  >
                    {pendingAssignment.incident?.urgency?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">
                  SITUATION REPORT
                </label>
                <p className="text-slate-300">
                  {pendingAssignment.incident?.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => handleAction("reject")}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 py-4 rounded-lg font-bold flex flex-col items-center gap-1 transition-all"
                >
                  <XCircle size={24} />
                  REJECT (Busy)
                </button>
                <button
                  onClick={() => handleAction("accept")}
                  className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-bold text-lg flex flex-col items-center gap-1 shadow-lg shadow-green-900/50 transition-all transform hover:scale-105"
                >
                  <CheckCircle size={24} />
                  ACCEPT MISSION
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CASE 2: Active Mission */}
        {activeAssignment && (
          <div className="w-full max-w-2xl bg-slate-800 rounded-xl border border-green-500/50 shadow-2xl overflow-hidden">
            <div className="bg-green-900/50 p-4 flex justify-between items-center border-b border-green-500/30">
              <h2 className="text-green-400 font-bold text-lg flex items-center gap-2">
                <Truck /> ACTIVE MISSION
              </h2>
              <span className="text-xs font-mono text-green-300 bg-green-900/80 px-2 py-1 rounded">
                {activeAssignment.status.toUpperCase()}
              </span>
            </div>

            <div className="p-6">
              <p className="text-slate-400 text-sm mb-6">
                You are currently assigned to incident
                <span className="font-mono text-yellow-500 ml-2">
                  {activeAssignment.incidentId}
                </span>
              </p>

              <div className="flex flex-col gap-4">
                {/* STAGE 1: Travel (Auto-managed by Server) */}
                {["assigned", "en_route", "en-route"].includes(
                  activeAssignment.status
                ) && (
                    <div className="w-full bg-slate-700/50 text-blue-400 p-8 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-4 border border-blue-500/20 shadow-inner">
                      <Loader2 size={48} className="animate-spin text-blue-500" />
                      <div className="flex flex-col items-center">
                        <span>EN ROUTE TO SCENE</span>
                        <span className="text-xs font-normal text-slate-500 mt-1 uppercase tracking-widest">
                          Auto-detecting arrival via GPS...
                        </span>
                      </div>
                    </div>
                  )}

                {/* STAGE 2: On Site Operations */}
                {["on_site", "on-site"].includes(activeAssignment.status) && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAction("backup")}
                      className="bg-red-600 hover:bg-red-500 text-white p-6 rounded-xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg border border-red-400"
                    >
                      <Siren size={32} className="animate-bounce" />
                      REQUEST BACKUP
                    </button>

                    <button
                      onClick={() => handleAction("resolved")}
                      className="bg-green-600 hover:bg-green-500 text-white p-6 rounded-xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg border border-green-400"
                    >
                      <CheckCircle size={32} />
                      MISSION COMPLETE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CASE 3: Idle */}
        {!pendingAssignment && !activeAssignment && (
          <div className="text-center opacity-50">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border-4 border-slate-700 border-dashed animate-spin-slow">
              <Radio size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-300">Standing By</h2>
            <p className="text-slate-500">
              Waiting for dispatch instructions...
            </p>
            <div className="mt-4 text-xs font-mono text-slate-600">
              ID: {teamId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionSdkPage;
