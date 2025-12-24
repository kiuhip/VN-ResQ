import { useState, useEffect } from 'react';
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
    assignments?: {
        id: string;
        team: {
            name: string;
        };
        etaSeconds?: number;
    }[];
}

interface Team {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: string; // idle, busy
    type: string;
}

const IncidentCard = ({ incident, onDispatch, onDelete }: { incident: Incident; onDispatch: (id: string) => void; onDelete: (id: string) => void }) => {
    const urgencyColors: Record<string, string> = {
        low: 'bg-green-500/20 text-green-400 border-green-500/50',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        critical: 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse',
    };

    const assignment = incident.assignments?.[0];
    const assignedTeam = assignment?.team?.name || null;
    const etaMins = assignment?.etaSeconds ? Math.ceil(assignment.etaSeconds / 60) : null;

    return (
        <div className={`relative p-4 rounded-lg border mb-3 backdrop-blur-sm ${urgencyColors[incident.urgency] || 'bg-gray-800'}`}>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(incident.id); }}
                className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors z-20"
                title="Resolve/Delete Incident"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="flex justify-between items-start pr-6">
                <h3 className="font-bold flex items-center gap-2 truncate pr-2" title={incident.locationText}>
                    <Siren size={16} className="flex-shrink-0" /> {incident.locationText}
                </h3>
                <span className="text-xs uppercase font-bold tracking-wider opacity-80">{incident.urgency}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">{incident.description}</p>

            {/* GPS Coordinate Status */}
            {!incident.latitude || !incident.longitude ? (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <MapPinned size={12} className="opacity-50" />
                    <span>No GPS coordinates available</span>
                </div>
            ) : (
                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                    <MapPinned size={12} />
                    <span>GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                </div>
            )}

            <div className="mt-3 flex gap-2">
                {assignedTeam ? (
                    <div className="bg-blue-900/50 text-blue-200 text-xs px-3 py-1.5 rounded-md flex items-center gap-1 border border-blue-500/30 w-full">
                        <CheckCircle size={12} />
                        <span>Assigned: {assignedTeam}</span>
                        {etaMins && <span className="ml-auto font-bold text-blue-100">~{etaMins} mins</span>}
                    </div>
                ) : (
                    <button
                        onClick={() => onDispatch(incident.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                    >
                        <Radio size={12} /> Dispatch Team
                    </button>
                )}
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        // Poll incidents and teams
        const fetchData = async () => {
            try {
                const [resIncidents, resTeams] = await Promise.all([
                    axios.get('http://localhost:3000/api/incidents'),
                    axios.get('http://localhost:3000/api/teams')
                ]);
                setIncidents(resIncidents.data);
                setTeams(resTeams.data);
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDispatch = async (id: string) => {
        try {
            const res = await axios.post('http://localhost:3000/api/dispatch', { incidentId: id });
            alert(`✅ Success: ${res.data.message}\nTeam: ${res.data.team.name}\nDistance: ${res.data.distance_km} km`);
            // Refresh data immediately
            const [resIncidents, resTeams] = await Promise.all([
                axios.get('http://localhost:3000/api/incidents'),
                axios.get('http://localhost:3000/api/teams')
            ]);
            setIncidents(resIncidents.data);
            setTeams(resTeams.data);
        } catch (error: any) {
            alert(`❌ Dispatch Failed: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Confirm resolve/delete this incident?")) return;
        try {
            await axios.delete(`http://localhost:3000/api/incidents/${id}`);
            // Optimistic update
            setIncidents(prev => prev.filter(i => i.id !== id));
            // Also refresh teams to free up status
            const resTeams = await axios.get('http://localhost:3000/api/teams');
            setTeams(resTeams.data);
        } catch (error: any) {
            alert(`❌ Delete Failed: ${error.response?.data?.error || error.message}`);
        }
    };

    // Only show markers for incidents with real GPS coordinates
    const markers = [
        // Incidents
        ...incidents
            .filter(i => i.latitude != null && i.longitude != null)
            .map(i => ({
                id: i.id,
                lat: i.latitude!,
                lng: i.longitude!,
                color: '#FBBC04', // Incident Color (Yellow)
                title: i.locationText
            })),
        // Teams from DB
        ...teams.map(t => ({
            id: t.id,
            lat: t.latitude,
            lng: t.longitude,
            color: t.status === 'busy' ? '#9AA0A6' : '#4285F4', // Blue if idle, Grey if busy
            title: `${t.name} (${t.status})`
        }))
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
                            <IncidentCard key={inc.id} incident={inc} onDispatch={handleDispatch} onDelete={handleDelete} />
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
                            <div className="text-xl font-bold text-blue-500">{teams.length}</div>
                            <div className="text-[10px] uppercase text-gray-400">Teams Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
