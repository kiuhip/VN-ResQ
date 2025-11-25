'use client';

import { fetchAlerts, Alert } from '@/lib/api';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function AlertsPage() {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Emergency Alerts</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">History</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">Export Report</button>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {alerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${alert.status === 'Critical'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : alert.status === 'High'
                                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            <AlertTriangle className="w-3 h-3" />
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-200 font-medium">{alert.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            {alert.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate">{alert.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-400 hover:text-blue-300 font-medium text-xs uppercase tracking-wider">
                                            Dispatch
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alerts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No active alerts found. System monitoring...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
