import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin } from 'lucide-react';

interface MapProps {
    markers?: { id: string; lat: number; lng: number; color?: string; title?: string }[];
    center?: { lat: number; lng: number };
    zoom?: number;
}

// Function to create custom icons using Lucide React
const createCustomIcon = (color: string) => {
    const iconHtml = renderToStaticMarkup(
        <div style={{
            color: color,
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
            // transform: 'translate(-50%, -100%)' <--- REMOVED: iconAnchor handles this
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
        }}>
            <MapPin size={32} fill="currentColor" />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon', // No default styles
        iconSize: [32, 32],
        iconAnchor: [16, 32], // Tip usage: 16 (center x), 32 (bottom y)
        popupAnchor: [0, -36]
    });
};

export const Map = ({ markers = [], center = { lat: 21.0285, lng: 105.8542 }, zoom = 13 }: MapProps) => {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ width: '100%', height: '100%' }}
            className="z-0" // Ensure map stays behind overlays
        >
            {/* Dark Matter Tiles for "Beautiful/Premium" look matching Dark Mode */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {markers.map((m) => (
                <Marker
                    key={m.id}
                    position={[m.lat, m.lng]}
                    icon={createCustomIcon(m.color || '#FBBC04')}
                >
                    <Popup className="text-black">
                        <div className="font-bold">{m.title}</div>
                        <div className="text-xs text-gray-600">ID: {m.id}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};
