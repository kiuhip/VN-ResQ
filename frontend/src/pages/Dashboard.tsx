import React, { useState, useEffect } from 'react';
import { Map } from '../components/Map';
import axios from 'axios';
import { LayoutDashboard, MapPinned, Phone, Radio, Siren, CheckCircle } from 'lucide-react';

// Mock types
interface Incident {
    id: string;
    locationText: string;
    latitude?: number;
    longitude?: number;
    urgency: string;
    status: string;
    description?: string;
}

interface Team {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

const IncidentCard = ({ incident, onDispatch }: { incident: Incident; onDispatch: (id: string) => void }) => {
    const urgencyColors: Record<string, string> = {
        low: 'bg-green-500/20 text-green-400 border-green-500/50',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        critical: 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse',
    };

    return (
        <div className={`p-4 rounded-lg border mb-3 backdrop-blur-sm ${urgencyColors[incident.urgency] || 'bg-gray-800'}`}>
            <div className="flex justify-between items-start">
                <h3 className="font-bold flex items-center gap-2">
                    <Siren size={16} /> {incident.locationText}
                </h3>
                <span className="text-xs uppercase font-bold tracking-wider opacity-80">{incident.urgency}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{incident.description}</p>
            <div className="mt-3 flex gap-2">
                <button
                    onClick={() => onDispatch(incident.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                >
                    <Radio size={12} /> Dispatch Team
                </button>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        // Poll incidents
        const fetchIncidents = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/incidents');
                setIncidents(res.data);
            } catch (e) {
                console.error("Failed to fetch incidents", e);
            }
        };

        fetchIncidents();
        const interval = setInterval(fetchIncidents, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDispatch = (id: string) => {
        console.log("Dispatching for", id);
        // TODO: Implement dispatch logic
        alert(`Dispatch triggered for Incident ${id}`);
    };

    // Mock markers
    const markers = [
        // Incidents
        ...incidents.map(i => ({
            id: i.id,
            lat: i.latitude || 21.0285 + (Math.random() - 0.5) * 0.05, // Mock coords if null
            lng: i.longitude || 105.8542 + (Math.random() - 0.5) * 0.05,
            color: '#FBBC04',
            title: i.locationText
        })),
        // Teams (Mock)
        { id: 't1', lat: 21.03, lng: 105.85, color: '#4285F4', title: 'Team Alpha' },
        { id: 't2', lat: 21.02, lng: 105.86, color: '#4285F4', title: 'Team Bravo' }
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-96 flex flex-col border-r border-gray-700 bg-gray-900/95 z-10">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="text-blue-500" /> RESCUE COM.
                    </h1>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1 text-green-400"><CheckCircle size={12} /> Online</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700">
                    <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                        <Phone size={14} /> ACTIVE INCIDENTS
                    </h2>
                    {incidents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-10">No active incidents</p>
                    ) : (
                        incidents.map(inc => (
                            <IncidentCard key={inc.id} incident={inc} onDispatch={handleDispatch} />
                        ))
                    )}
                </div>
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative">
                <Map markers={markers} />

                {/* Overlay Stats */}
                <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md p-3 rounded-lg border border-gray-700 shadow-xl">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-xl font-bold text-red-500">{incidents.length}</div>
                            <div className="text-[10px] uppercase text-gray-400">Incidents</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-blue-500">2</div>
                            <div className="text-[10px] uppercase text-gray-400">Teams Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
