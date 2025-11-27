'use client';

import MapWrapper from '@/components/map';
import { AlertTriangle, Phone, Video, Users, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAlerts, fetchResources, Alert, Resource } from '@/lib/api';

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [alertsData, resourcesData] = await Promise.all([
        fetchAlerts(),
        fetchResources()
      ]);
      setAlerts(alertsData);
      setResources(resourcesData);
    };
    loadData();

    // Poll every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts', value: alerts.length.toString(), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Incoming Calls', value: '3', icon: Phone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Camera Detections', value: '8', icon: Video, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Rescue Units', value: `${resources.filter(r => r.status === 'Available').length}/${resources.length}`, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

        {/* Map Section */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-1 flex flex-col relative group">
          <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2">
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
            Live Monitoring
          </div>
          <div className="flex-1 rounded-lg overflow-hidden">
            <MapWrapper alerts={alerts} />
          </div>
        </div>

        {/* Feed Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Incoming Alerts</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Live Feed</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${alert.status === 'Critical' ? 'bg-red-500' : alert.status === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                    <span className="font-medium text-slate-200 text-sm">{alert.type}</span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{alert.location}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{alert.description}</p>
                <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">Dispatch</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
