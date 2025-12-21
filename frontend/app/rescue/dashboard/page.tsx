'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import Map with no SSR
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-200 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export default function DashboardPage() {
    const [incidents, setIncidents] = useState([]);
    const [teams, setTeams] = useState([]);

    const fetchData = async () => {
        try {
            const incRes = await fetch('http://localhost:8000/api/incidents/');
            const teamRes = await fetch('http://localhost:8000/api/teams/');

            if (incRes.ok) setIncidents(await incRes.json());
            if (teamRes.ok) setTeams(await teamRes.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const criticalIncidents = incidents.filter((i: any) => i.priority === 'critical').length;
    const activeTeams = teams.filter((t: any) => t.status === 'busy').length;

    return (
        <div className="flex flex-col h-full">
            {/* Top Stats Bar */}
            <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold text-slate-800">Operational Dashboard</h2>
                <div className="flex space-x-4">
                    <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                        <span className="font-bold text-xl block leading-none">{criticalIncidents}</span>
                        <span className="text-xs uppercase font-semibold">Critical Incidents</span>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                        <span className="font-bold text-xl block leading-none">{activeTeams}</span>
                        <span className="text-xs uppercase font-semibold">Teams Deployed</span>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <Map incidents={incidents} teams={teams} />
            </div>
        </div>
    );
}
