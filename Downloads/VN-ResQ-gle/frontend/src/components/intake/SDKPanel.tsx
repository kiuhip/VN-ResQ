import { Copy, Terminal, Play, Loader2, Code2, Wifi, WifiOff, Database } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export const SDKPanel = () => {
    const [testQuery, setTestQuery] = useState("Ngập lụt tại phố Thái Hà, Đống Đa");
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState<any>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [liveEvents, setLiveEvents] = useState<any[]>([]);
    const eventSourceRef = useRef<EventSource | null>(null);

    const apiKey = "resq_live_Mk92837102938102938";

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const runPlayground = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/incidents', {
                text: testQuery,
                source: 'sdk_playground'
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
            const ev = new EventSource('http://localhost:3000/api/incidents/stream');
            ev.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setLiveEvents(prev => [data, ...prev].slice(0, 5));
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">

            {/* 🛠️ LIVE PLAYGROUND */}
            <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-500/30">
                <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-3 text-sm">
                    <Terminal size={16} /> Thử Nghiệm SDK Trực Tiếp
                </h3>

                <div className="space-y-3">
                    <textarea
                        className="w-full bg-black/60 border border-blue-500/20 rounded-md p-3 text-xs text-blue-100 font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                        rows={2}
                        placeholder="Nhập tin nhắn khẩn cấp để thử nghiệm..."
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                    />

                    <button
                        onClick={runPlayground}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        Thực Thi Gọi SDK
                    </button>

                    {lastResponse && (
                        <div className="bg-black/80 p-3 rounded-md border border-gray-800 text-[10px] font-mono overflow-auto max-h-40">
                            <div className="text-gray-500 mb-1">// RESPONSE</div>
                            <pre className="text-green-400">{JSON.stringify(lastResponse, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>

            {/* ⚡ REAL-TIME ECHO */}
            <div className={`p-4 rounded-lg border transition-all duration-300 ${isStreaming ? 'bg-purple-600/10 border-purple-500/40' : 'bg-gray-800/20 border-gray-700/50'}`}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold flex items-center gap-2 text-sm ${isStreaming ? 'text-purple-400' : 'text-gray-400'}`}>
                        {isStreaming ? <Wifi size={16} className="animate-pulse" /> : <WifiOff size={16} />}
                        Luồng Trực Tiếp SDK
                    </h3>
                    <button
                        onClick={toggleStream}
                        className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all ${isStreaming ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-purple-500 text-white shadow-lg shadow-purple-900/20'}`}
                    >
                        {isStreaming ? 'DỪNG' : 'NGHE'}
                    </button>
                </div>

                {isStreaming ? (
                    <div className="space-y-2">
                        {liveEvents.length > 0 ? liveEvents.map((ev, i) => (
                            <div key={i} className="bg-black/40 p-2 rounded border border-purple-500/20 text-[9px] font-mono text-purple-200 animate-in slide-in-from-left-2">
                                <span className="text-purple-500">[{new Date().toLocaleTimeString()}]</span> {ev.type === 'connected' ? '⚡ Connected to Stream' : `📍 Mới: ${ev.data?.locationText}`}
                            </div>
                        )) : (
                            <div className="text-[10px] text-gray-600 text-center py-6 border border-dashed border-gray-800 rounded animate-pulse">
                                Đang chờ sự kiện phát sóng...
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-500 italic">Bật 'NGHE' để nhận cập nhật thời gian thực không cần polling.</p>
                )}
            </div>

            {/* 📜 CODE SNIPPET */}
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <h3 className="text-gray-400 font-bold flex items-center gap-2 mb-2 text-sm">
                    <Code2 size={16} /> Mã Tích Hợp Mẫu
                </h3>
                <div className="bg-black/60 p-3 rounded-md font-mono text-[10px] text-gray-300 relative group">
                    <pre className="overflow-x-auto">
                        {`const sdk = new VNResQSDK();
// Listen for real-time flood reports
sdk.subscribeToIncidents((event) => {
  console.log("New Event:", event);
});`}
                    </pre>
                    <button
                        onClick={() => copyToClipboard(`const sdk = new VNResQSDK();\nsdk.subscribeToIncidents((e) => console.log(e));`)}
                        className="absolute top-2 right-2 p-1 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Copy size={12} />
                    </button>
                </div>
            </div>

            {/* 🎯 COORDINATION STRATEGY */}
            <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <h3 className="text-green-400 font-bold flex items-center gap-2 mb-3 text-sm">
                    <Database size={16} /> Logic Điều Phối Tài Sản
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 bg-black/40 p-2 rounded">
                        <span>Chiến lược hiện tại:</span>
                        <span className="text-green-500 font-bold">RESOURCE_AWARE_OPTIMIZED</span>
                    </div>

                    <div className="p-3 bg-black/60 rounded border border-gray-800 space-y-2">
                        <div className="text-[10px] text-gray-400 flex justify-between items-center border-b border-gray-800 pb-1">
                            <span>Cụm Đang Chờ</span>
                            <span className="text-blue-400">2 Hoạt động</span>
                        </div>
                        <div className="text-[9px] text-gray-300">
                            <div className="flex items-center gap-2 py-1">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                <span>Cluster #A1: 5 sự cố tại Hoàn Kiếm (Lụt)</span>
                            </div>
                            <div className="flex items-center gap-2 py-1">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                <span>Cluster #B4: 3 cấp cứu y tế tại Đống Đa</span>
                            </div>
                        </div>
                        <button className="w-full mt-2 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-[10px] rounded border border-green-500/20 transition-all font-bold">
                            Tối Ưu Lộ Trình qua SDK
                        </button>
                    </div>
                </div>
            </div>

            {/* 🔑 API KEYS & DEETS */}
            <div className="grid grid-cols-1 gap-4 opacity-70">
                <div className="bg-gray-800/30 p-3 rounded border border-gray-700 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase">Khóa Production</span>
                    <span className="text-yellow-600">{apiKey}</span>
                </div>
                <div className="bg-gray-800/30 p-3 rounded border border-gray-700 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase">Endpoint CSDL</span>
                    <span className="text-blue-600">cluster.vn-resq.io:5432</span>
                </div>
            </div>
        </div>
    );
};
