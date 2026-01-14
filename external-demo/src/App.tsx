// ... imports remain the same
import { useState, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ResQClient,
  IncidentsSDK,
  TeamsSDK,
  RescueLocationsSDK,
  MapSDK,
} from "vn-resq-sdk";
import {
  Globe,
  Users,
  Siren,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Lock,
  ArrowRight,
} from "lucide-react";

// ... MapComponent remains key logic same (omitted for brevity in replacement chunk if not changing, but here we replace whole file for cleanliness or just App part)
// Actually, to make it safer, I will keep MapComponent and just replace App function and export.

function MapComponent({
  mapSdk,
  teams,
  locations,
  incidents,
}: {
  mapSdk: MapSDK;
  teams: any[];
  locations: any[];
  incidents: any[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let isMounted = true;

    const map = L.map(mapContainerRef.current, {
      center: [21.0285, 105.8542],
      zoom: 13,
      zoomControl: false,
    });
    mapRef.current = map;

    L.control.zoom({ position: "topright" }).addTo(map);

    // Dynamic tile config from SDK
    mapSdk.getTileLayerConfig("hanoi").then((config) => {
      if (!isMounted) return;

      L.tileLayer(config.urlTemplate, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
      }).addTo(map);

      setTimeout(() => {
        if (isMounted) map.invalidateSize();
      }, 100);
    });

    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      isMounted = false;
      map.remove();
      mapRef.current = null;
    };
  }, [mapSdk]);

  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    teams.forEach((team) => {
      const isBusy = team.status === "busy";
      const color = isBusy ? "#ef4444" : "#10b981";
      const fillColor = isBusy ? "#7f1d1d" : "#064e3b";

      L.circleMarker([team.latitude, team.longitude], {
        radius: 7,
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.9,
        weight: 2,
      })
        .bindPopup(
          `<b>Rescue Team:</b> ${team.name
          }<br/><b>Status:</b> ${team.status.toUpperCase()}`
        )
        .addTo(markersRef.current!);
    });

    incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const marker = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-4 h-4 rounded-full bg-red-600 pulse-red border-2 border-white shadow-lg"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([inc.latitude, inc.longitude], { icon: marker })
        .bindPopup(
          `<b>Emergency:</b> ${inc.description || inc.locationText
          }<br/><b>Urgency:</b> ${inc.urgency?.toUpperCase()}`
        )
        .addTo(markersRef.current!);
    });
  }, [teams, incidents]);

  return (
    <div ref={mapContainerRef} className="w-full h-full bg-slate-900 relative">
      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[10px] font-black text-white uppercase mb-3 tracking-widest border-b border-white/5 pb-2">
            Legend
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse border-2 border-white/50" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Urgent Rescue Needed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Active ResQ Unit
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-6 left-6 z-[1000]">
        <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white shadow-xl flex items-center gap-2">
          <Globe size={14} /> LIVE SDK MAP ENGINE V3.4
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authStep, setAuthStep] = useState<"config" | "app">("config");
  const [apiKey, setApiKey] = useState("ADMIN_SECRET");

  const [logs, setLogs] = useState<string[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sosDescription, setSosDescription] = useState(
    "Flooding at Hoan Kiem Lake, needs urgent help"
  );

  const sdk = useMemo(() => {
    // Re-initialize SDK when apiKey changes (only if in app mode essentially but memo handles deps)
    const client = new ResQClient({
      baseUrl: "http://localhost:3000/api",
      apiKey: apiKey
    });
    return {
      incidents: new IncidentsSDK(client),
      teams: new TeamsSDK(client),
      locations: new RescueLocationsSDK(client),
      map: new MapSDK(client),
    };
  }, [apiKey]);

  const addLog = (msg: string) => {
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5)
    );
  };

  const refreshData = async () => {
    try {
      const [tList, lList, iList] = await Promise.all([
        sdk.teams.list(),
        sdk.locations.list(),
        sdk.incidents.list({ status: "open" }),
      ]);
      setTeams(tList);
      setLocations(lList);
      setIncidents(iList);
      addLog(
        `Sync: ${tList.length} Teams, ${lList.length} Points, ${iList.length} Emergencies.`
      );
    } catch (e: any) {
      addLog(`Sync Failure: ${e.message || "Backend Unreachable"}`);
    }
  };

  useEffect(() => {
    if (authStep === "app") {
      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [authStep]);

  const reportIncident = async () => {
    if (!sosDescription.trim()) return;
    addLog(`Broadcasting SOS...`);
    setIsLoading(true);
    try {
      const res = await sdk.incidents.create({
        text: sosDescription,
        source: "external_demo_v2",
      });
      addLog(`Broadcast OK: #${res.id.substring(0, 8)}`);
      setSosDescription("");
      refreshData();
    } catch (e: any) {
      addLog(`Fail: ${e.message}`); // Will show Permission Denied for Viewer
    } finally {
      setIsLoading(false);
    }
  };

  if (authStep === "config") {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">SDK Authentication</h1>
            <p className="text-slate-500 text-sm mt-2">Select an access level to initialize the VN-ResQ SDK environment.</p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { key: "ADMIN_SECRET", label: "Admin Access", desc: "Full Control (Read/Write)", color: "text-emerald-400" },
              { key: "VIEWER_SECRET", label: "Viewer Access", desc: "Read Only (No Dispatch/Signal)", color: "text-blue-400" },
              { key: "INVALID_KEY", label: "Invalid Token", desc: "Simulation of unauthorized access", color: "text-red-400" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setApiKey(opt.key)}
                className={`w-full p-4 rounded-xl border transition-all text-left group ${apiKey === opt.key
                    ? "bg-slate-800 border-blue-500 shadow-lg shadow-blue-900/20"
                    : "bg-slate-950 border-slate-800 hover:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-sm ${opt.color}`}>{opt.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{opt.key}</p>
                  </div>
                  {apiKey === opt.key && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">{opt.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setAuthStep("app")}
            className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            Initialize SDK <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 antialiased font-sans flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">
              VN-ResQ SDK <span className="text-blue-500">Node</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase opacity-60">
                Real-time Emergency Grid
              </span>
              <span className="text-[10px] bg-slate-800 px-2 rounded text-slate-300 font-mono border border-white/10">{apiKey}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setAuthStep("config")} className="flex items-center gap-2 hover:text-white transition-colors">
            <Lock size={14} />
            <span className="text-[10px] font-bold uppercase">Change Auth</span>
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              SDK Connected
            </span>
          </div>
          <button
            onClick={refreshData}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="flex-1 mt-24 px-8 pb-8 flex flex-col gap-8">
        {/* TOP PANEL: INPUT AND LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SOS GATEWAY */}
          <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <Siren
              size={120}
              className="absolute -top-10 -right-10 opacity-10"
            />
            <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">
              Emergency Signal
            </h2>
            <textarea
              value={sosDescription}
              onChange={(e) => setSosDescription(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-blue-100/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none shadow-inner flex-1 mb-4"
              placeholder="Describe situation..."
            />
            <button
              onClick={reportIncident}
              disabled={isLoading}
              className="bg-white text-blue-700 w-full py-4 rounded-2xl font-black text-xs hover:bg-blue-50 disabled:opacity-50 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Siren size={16} />
              )}
              Signal Rescue
            </button>
          </div>

          {/* TEAM LIST */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-md flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-emerald-400" /> Rescue Units
              </h3>
              <span className="text-[10px] text-slate-500 font-bold">
                {teams.length} ONLINE
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-emerald-500/20 transition-all"
                >
                  <span className="text-[11px] font-bold text-slate-300">
                    {t.name}
                  </span>
                  <div
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${t.status === "busy"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-emerald-500/10 text-emerald-500"
                      }`}
                  >
                    {t.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRANSACTION LOG */}
          <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-[32px] p-6 backdrop-blur-md flex flex-col h-[320px]">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Terminal size={14} className="text-blue-400" /> SDK Stream
            </h3>
            <div className="space-y-2 flex-1 overflow-hidden">
              {logs.map((l, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-mono border-l-2 pl-3 py-1 rounded-r-lg ${l.includes("Fail") || l.includes("Failure")
                      ? "text-red-300 border-red-500/30 bg-red-500/5"
                      : "text-blue-300 border-blue-500/30 bg-blue-500/5"
                    }`}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-40">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                Auth: {apiKey}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                TLS 1.3
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL: FULL SCREEN MAP */}
        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[40px] overflow-hidden relative shadow-inner min-h-[500px]">
          <MapComponent
            mapSdk={sdk.map}
            teams={teams}
            locations={locations}
            incidents={incidents}
          />

          {/* MAP OVERLAYS */}
          <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
              <h4 className="text-[10px] font-black text-white uppercase mb-3 tracking-widest border-b border-white/5 pb-2">
                Legend
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse border-2 border-white/50" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Urgent Rescue Needed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Active ResQ Unit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Strategic Relay Node
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-6 left-6 z-[1000]">
            <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-white shadow-xl flex items-center gap-2">
              <Globe size={14} /> LIVE SDK MAP ENGINE V3.4
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 pb-8 text-center">
        <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">
          VN-ResQ Private SDK Infrastructure • Internal Use Only
        </p>
      </footer>
    </div>
  );
}

export default App;
