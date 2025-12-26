import {
  Copy,
  Terminal,
  Play,
  Loader2,
  Wifi,
  WifiOff,
  Database,
  Map as MapIcon,
  Globe,
  Lock,
  Server,
  Layers,
  Users,
  MapPinned,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ConnectionStatus } from "./ConnectionStatus";

const PROVINCES = [
  { id: "hanoi", name: "Hà Nội", endpoint: "han-01.vn-resq.io" },
  { id: "danang", name: "Đà Nẵng", endpoint: "dad-02.vn-resq.io" },
  { id: "hcm", name: "TP. Hồ Chí Minh", endpoint: "sgn-03.vn-resq.io" },
];

export const SDKPanel = () => {
  const [selectedProvince, setSelectedProvince] = useState(PROVINCES[0]);
  const [testQuery, setTestQuery] = useState("Cứu hộ ngập lụt tại khu vực...");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const apiKey = `resq_live_${selectedProvince.id}_${Math.random()
    .toString(36)
    .substring(7)
    .toUpperCase()}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const runPlayground = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/incidents", {
        text: testQuery,
        source: "sdk_playground",
        region: selectedProvince.id,
      });
      setLastResponse(response.data);
    } catch (error: any) {
      setLastResponse({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStream = () => {
    if (isStreaming) {
      eventSourceRef.current?.close();
      setIsStreaming(false);
      setLiveEvents([]);
    } else {
      setIsStreaming(true);
      const ev = new EventSource("http://localhost:3000/api/incidents/stream");
      ev.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setLiveEvents((prev) => [data, ...prev].slice(0, 5));
      };
      ev.onerror = () => {
        setIsStreaming(false);
        ev.close();
      };
      eventSourceRef.current = ev;
    }
  };

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[85vh] pr-4 custom-scrollbar text-left">
      {/* 📍 REGIONAL SELECTION */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Globe size={20} />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Deployment Region</h4>
            <p className="text-[10px] text-gray-500">
              Select local node for low-latency coordination
            </p>
          </div>
        </div>
        <select
          value={selectedProvince.id}
          onChange={(e) =>
            setSelectedProvince(
              PROVINCES.find((p) => p.id === e.target.value) || PROVINCES[0]
            )
          }
          className="bg-black border border-slate-700 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none cursor-pointer"
        >
          {PROVINCES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} Node
            </option>
          ))}
        </select>
      </div>

      {/* 🚀 LIVE PLAYGROUND */}
      <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <Terminal size={100} />
        </div>
        <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4 text-sm tracking-tight text-left">
          <Terminal size={18} /> SDK Live Playground
        </h3>

        <div className="space-y-4">
          <textarea
            className="w-full bg-black/60 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-100 font-mono focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-blue-900/50"
            rows={2}
            placeholder="Type an emergency message to test..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
          />

          <button
            onClick={runPlayground}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/40"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            Execute Node Transaction
          </button>

          {lastResponse && (
            <div className="bg-black/80 p-4 rounded-xl border border-slate-800 text-[10px] font-mono overflow-auto max-h-48 group/resp relative">
              <div className="text-gray-600 mb-2 flex justify-between items-center bg-slate-900/50 -mx-4 -mt-4 p-2 px-4 border-b border-slate-800">
                <span>// HTTP 201 CREATED</span>
                <span className="text-[8px] text-blue-500 tracking-widest">
                  {selectedProvince.endpoint}
                </span>
              </div>
              <pre className="text-green-400 mt-2 text-left">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 🗄️ DATABASE GATEWAY (NEW) */}
      <div className="bg-emerald-600/10 p-5 rounded-2xl border border-emerald-500/30">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-emerald-400 font-bold flex items-center gap-2 text-sm text-left">
            <Database size={18} /> Asset Database Gateway
          </h3>
          <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold tracking-tighter uppercase">
            read_write_db
          </span>
        </div>

        <div className="space-y-3 text-left">
          <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/10 space-y-2 relative group">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Server size={10} /> Connection Protocol
            </div>
            <div className="text-xs text-white font-mono break-all pr-8">
              postgresql://dev:{apiKey.substring(10, 18)}@
              {selectedProvince.endpoint}:5432/resq_data
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  `postgresql://dev:REDACTED@${selectedProvince.endpoint}:5432/resq_data`
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800">
              <div className="text-[9px] text-gray-400 mb-2 flex items-center gap-1">
                <Layers size={10} /> Data Models
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-gray-500">
                  <span>• incidents</span>
                  <span className="text-emerald-600/60">TS Vector</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>• teams</span>
                  <span className="text-emerald-600/60">GeoJson</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>• logs</span>
                  <span className="text-emerald-600/60">Immutable</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
              <Lock size={20} className="text-emerald-500/40 mb-1" />
              <div className="text-[9px] text-gray-300 font-bold">
                Encrypted via TLS 1.3
              </div>
              <div className="text-[8px] text-gray-500">
                Zero-Trust Access Required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ MAP & GEO-SPATIAL API */}
      <div className="bg-amber-600/10 p-5 rounded-2xl border border-amber-500/30 shadow-lg text-left">
        <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4 text-sm text-left">
          <MapIcon size={18} /> Map & Geo-Spatial API
        </h3>

        <div className="space-y-4 text-left">
          <div className="bg-black/60 p-4 rounded-xl border border-amber-500/10 space-y-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-200/60 flex items-center gap-1 uppercase tracking-widest font-bold">
                <Globe size={10} /> SDK Integration
              </span>
              <span className="text-amber-500">v2.1</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg text-[9px] font-mono text-gray-300 relative group text-left">
              <pre>
                {`const mapSdk = new MapSDK(client);
const config = await mapSdk.getTileLayerConfig('${selectedProvince.id}');
L.tileLayer(config.urlTemplate, {
  attribution: config.attribution,
  maxZoom: config.maxZoom
}).addTo(map);`}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `const mapSdk = new MapSDK(client);\nconst config = await mapSdk.getTileLayerConfig('${selectedProvince.id}');\nL.tileLayer(config.urlTemplate, { attribution: config.attribution, maxZoom: config.maxZoom }).addTo(map);`
                  )
                }
                className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚑 RESCUE TEAMS NETWORK */}
      <div className="bg-cyan-600/10 p-5 rounded-2xl border border-cyan-500/30 text-left">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-4 text-sm">
          <Users size={18} /> Rescue Teams Network
        </h3>
        <div className="space-y-4">
          <div className="bg-black/60 p-4 rounded-xl border border-cyan-500/10 space-y-3">
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
              Team Tracking Snippet
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg text-[9px] font-mono text-gray-300 relative group">
              <pre>
                {`const teamsSdk = new TeamsSDK(client);
const activeTeams = await teamsSdk.list();
activeTeams.forEach(team => {
  console.log(\`Team \${team.name} is \${team.status}\`);
});`}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `const teamsSdk = new TeamsSDK(client);\nconst activeTeams = await teamsSdk.list();\nactiveTeams.forEach(t => console.log(t));`
                  )
                }
                className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📍 STRATEGIC RESCUE LOCATIONS */}
      <div className="bg-rose-600/10 p-5 rounded-2xl border border-rose-500/30 text-left">
        <h3 className="text-rose-400 font-bold flex items-center gap-2 mb-4 text-sm">
          <MapPinned size={18} /> Strategic Rescue Locations
        </h3>
        <div className="space-y-4">
          <div className="bg-black/60 p-4 rounded-xl border border-rose-500/10 space-y-3">
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
              Safe Zones & Hubs
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg text-[9px] font-mono text-gray-300 relative group">
              <pre>
                {`const locSdk = new RescueLocationsSDK(client);
const safeZones = await locSdk.list();
// Register a new medical hub
await locSdk.create({
  text: "Medical Hub Alpha",
  latitude: 21.0285,
  longitude: 105.8542
});`}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(
                    `const locSdk = new RescueLocationsSDK(client);\nconst zones = await locSdk.list();`
                  )
                }
                className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ REAL-TIME ECHO */}
      <div
        className={`p-6 rounded-2xl border transition-all duration-300 text-left ${
          isStreaming
            ? "bg-purple-600/10 border-purple-500/40 shadow-xl shadow-purple-500/5"
            : "bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100"
        }`}
      >
        <div className="flex justify-between items-center mb-5">
          <h3
            className={`font-bold flex items-center gap-2 text-sm text-left ${
              isStreaming ? "text-purple-400" : "text-gray-400"
            }`}
          >
            {isStreaming ? (
              <Wifi size={20} className="animate-pulse" />
            ) : (
              <WifiOff size={20} />
            )}
            Live Event Stream
          </h3>
          <button
            onClick={toggleStream}
            className={`text-xs px-6 py-2 rounded-full font-bold transition-all ${
              isStreaming
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30"
            }`}
          >
            {isStreaming ? "TERMINATE" : "INITIATE"}
          </button>
        </div>

        {isStreaming ? (
          <div className="space-y-3 text-left">
            {liveEvents.length > 0 ? (
              liveEvents.map((ev, i) => (
                <div
                  key={i}
                  className="bg-black/60 p-3 rounded-xl border border-purple-500/20 text-[9px] font-mono text-purple-200 animate-in slide-in-from-left-4 duration-500 text-left"
                >
                  <span className="text-purple-500 font-bold">
                    [{new Date().toLocaleTimeString()}]
                  </span>{" "}
                  {ev.type === "connected"
                    ? "⚡ Connection established"
                    : `📍 Event: ${ev.data?.locationText}`}
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-600 text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl animate-pulse">
                Awaiting broadcast signals from node...
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-4 bg-black/20 rounded-xl">
            Authorize streaming session to capture live flood telemetry.
          </p>
        )}
      </div>

      {/* 🔑 SYSTEM CREDENTIALS */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-left">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-4 text-left">
          <Lock size={14} /> Security Context (Live Mode)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-black/40 p-4 rounded-xl border border-slate-800 relative group text-left">
            <div className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-1 text-left">
              Production API Key
            </div>
            <div className="text-xs text-amber-500/90 font-mono select-none text-left">
              {apiKey.substring(0, 16)}••••••••
            </div>
            <button
              onClick={() => copyToClipboard(apiKey)}
              className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-slate-800 relative group text-left">
            <div className="text-[8px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-1 text-left">
              REST Endpoint
            </div>
            <div className="text-xs text-blue-400 font-mono text-left">
              https://api.{selectedProvince.endpoint}
            </div>
            <button
              onClick={() =>
                copyToClipboard(`https://api.${selectedProvince.endpoint}`)
              }
              className="absolute top-1/2 -translate-y-1/2 right-3 p-2 bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </div>

      <ConnectionStatus />
    </div>
  );
};
