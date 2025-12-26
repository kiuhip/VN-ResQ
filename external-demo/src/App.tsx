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
} from "lucide-react";

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
      if (!isMounted) return; // Prevent adding layer to destroyed map

      L.tileLayer(config.urlTemplate, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
      }).addTo(map);

      // Crucial for rendering in flex/hidden containers
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

    // 2. Teams (Green for Idle, Red for Busy)
    teams.forEach((team) => {
      const isBusy = team.status === "busy";
      const color = isBusy ? "#ef4444" : "#10b981"; // Red-500 : Emerald-500
      const fillColor = isBusy ? "#7f1d1d" : "#064e3b"; // Red-900 : Emerald-900

      L.circleMarker([team.latitude, team.longitude], {
        radius: 7,
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.9,
        weight: 2,
      })
        .bindPopup(
          `<b>Rescue Team:</b> ${
            team.name
          }<br/><b>Status:</b> ${team.status.toUpperCase()}`
        )
        .addTo(markersRef.current!);
    });

    // 3. Incidents (Needs Rescue - Pulsing Red)
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
          `<b>Emergency:</b> ${
            inc.description || inc.locationText
          }<br/><b>Urgency:</b> ${inc.urgency?.toUpperCase()}`
        )
        .addTo(markersRef.current!);
    });
  }, [teams, incidents]);

  return (
    <div ref={mapContainerRef} className="w-full h-full bg-slate-900 relative">
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
  const [logs, setLogs] = useState<string[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sosDescription, setSosDescription] = useState(
    "Flooding at Hoan Kiem Lake, needs urgent help"
  );

  const sdk = useMemo(() => {
    const client = new ResQClient({ baseUrl: "http://localhost:3000/api" });
    return {
      incidents: new IncidentsSDK(client),
      teams: new TeamsSDK(client),
      locations: new RescueLocationsSDK(client),
      map: new MapSDK(client),
    };
  }, []);

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
    } catch (e) {
      addLog("Sync failure: Backend unreachable");
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

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
      addLog(`Fail: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase opacity-60">
              Real-time Emergency Response Grid
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
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
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      t.status === "busy"
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
                  className="text-[10px] font-mono text-blue-300 border-l-2 border-blue-500/30 pl-3 py-1 bg-blue-500/5 rounded-r-lg"
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-40">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
                Auth: SECURE_TOKEN
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
