'use client';
import { useEffect, useState } from 'react';

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [newTeam, setNewTeam] = useState({ name: '', phone: '', current_lat: 21.0, current_lng: 105.8 });

    const fetchTeams = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/teams/');
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchTeams(); }, []);

    const createTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('http://localhost:8000/api/teams/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeam)
        });
        fetchTeams();
        setNewTeam({ name: '', phone: '', current_lat: 21.0, current_lng: 105.8 });
    };

    return (
        <div className="p-6 overflow-auto h-full">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Rescue Teams</h1>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
                <h3 className="text-lg font-medium mb-4">Add New Team</h3>
                <form onSubmit={createTeam} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                        <input value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} className="border rounded p-2 text-sm" placeholder="Beta Team" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                        <input value={newTeam.phone} onChange={e => setNewTeam({ ...newTeam, phone: e.target.value })} className="border rounded p-2 text-sm" placeholder="09xx..." required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Lat</label>
                        <input type="number" step="0.0001" value={newTeam.current_lat} onChange={e => setNewTeam({ ...newTeam, current_lat: parseFloat(e.target.value) })} className="border rounded p-2 text-sm w-24" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Lng</label>
                        <input type="number" step="0.0001" value={newTeam.current_lng} onChange={e => setNewTeam({ ...newTeam, current_lng: parseFloat(e.target.value) })} className="border rounded p-2 text-sm w-24" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Add Team</button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team: any) => (
                    <div key={team.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-900">{team.name}</h3>
                            <p className="text-sm text-slate-500">{team.phone}</p>
                            <p className="text-xs text-slate-400 mt-2">Loc: {team.current_lat?.toFixed(4)}, {team.current_lng?.toFixed(4)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${team.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {team.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
