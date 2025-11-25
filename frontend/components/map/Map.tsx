'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { Alert } from '@/lib/api';

// Fix for default marker icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const criticalIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    alerts: Alert[];
}

export default function Map({ alerts }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Map Data...</div>;
    }

    return (
        <MapContainer
            center={[21.0285, 105.8542]} // Hanoi coordinates
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {alerts.map((alert) => (
                <Marker
                    key={alert.id}
                    position={[alert.lat, alert.lng]}
                    icon={alert.status === 'Critical' ? criticalIcon : icon}
                >
                    <Popup>
                        <div className="text-slate-900">
                            <div className="font-bold">{alert.type}</div>
                            <div className="text-xs">{alert.location}</div>
                            <div className="text-xs mt-1">{alert.description}</div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
