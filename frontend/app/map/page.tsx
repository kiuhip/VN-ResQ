'use client';

import MapWrapper from '@/components/map';
import { fetchAlerts, Alert } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Filter, Layers } from 'lucide-react';

export default function MapPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const loadAlerts = async () => {
            const data = await fetchAlerts();
            setAlerts(data);
        };
        loadAlerts();
        const interval = setInterval(loadAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-full w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <MapWrapper alerts={alerts} />

            {/* Overlay Controls */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                <button className="bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Layers className="w-5 h-5" />
                </button>
                <button className="bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-700 max-w-xs">
                <h3 className="font-semibold text-white mb-2">Live Status</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Active Units</span>
                        <span className="text-green-400 font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Critical Alerts</span>
                        <span className="text-red-400 font-medium">
                            {alerts.filter(a => a.status === 'Critical').length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
