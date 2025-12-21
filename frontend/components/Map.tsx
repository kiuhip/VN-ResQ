'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// We need to supply icon images manually or via CDN if not in public folder
// For this environment, I'll rely on CDN for default icons if local ones fail, 
// or I'll just skip the icon fix complexity and hope for best or use circle markers.

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Map({ incidents, teams }: { incidents?: any[], teams?: any[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="h-full w-full bg-slate-200 animate-pulse flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidents?.map((incident) => (
                incident.lat && incident.lng && (
                    <Marker key={`inc-${incident.id}`} position={[incident.lat, incident.lng]}>
                        <Popup>
                            <strong>{incident.incident_type}</strong><br />
                            Priority: {incident.priority}<br />
                            People: {incident.num_people}<br />
                            Status: {incident.status}
                        </Popup>
                    </Marker>
                )
            ))}

            {teams?.map((team) => (
                team.current_lat && team.current_lng && (
                    <Marker key={`team-${team.id}`} position={[team.current_lat, team.current_lng]} opacity={0.7}>
                        <Popup>
                            <strong>Team: {team.name}</strong><br />
                            Status: {team.status}<br />
                            Phone: {team.phone}
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
