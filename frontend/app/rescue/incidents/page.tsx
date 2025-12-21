'use client';
import { useEffect, useState } from 'react';

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState([]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/incidents/');
            if (res.ok) setIncidents(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchIncidents(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await fetch(`http://localhost:8000/api/incidents/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchIncidents();
    };

    return (
        <div className="p-6 overflow-auto h-full">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Incident Management</h1>
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type / Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location / Desc</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {incidents.map((incident: any) => (
                            <tr key={incident.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{incident.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{incident.incident_type}</div>
                                    <div className={`text-xs inline-flex px-2 py-0.5 rounded-full ${incident.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                            incident.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {incident.priority.toUpperCase()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-900">{incident.location_desc}</div>
                                    <div className="text-sm text-slate-500 truncate max-w-xs">{incident.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${incident.status === 'received' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {incident.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => updateStatus(incident.id, 'processing')} className="text-blue-600 hover:text-blue-900 mr-3">Verify</button>
                                    <button onClick={() => updateStatus(incident.id, 'done')} className="text-green-600 hover:text-green-900">Resolve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
