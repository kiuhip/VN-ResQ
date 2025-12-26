import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Siren, Truck, Activity } from "lucide-react";

interface MapProps {
  markers?: {
    id: string;
    lat: number;
    lng: number;
    color?: string;
    title?: string;
    type?: string;
  }[];
  lines?: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    color?: string;
  }[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Function to create custom icons using Lucide React
const createCustomIcon = (color: string, type?: string) => {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        color: color,
        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {type === "incident" ? (
        <Siren
          size={32}
          fill="currentColor"
          fillOpacity={0.2}
          strokeWidth={2.5}
        />
      ) : type === "team" ? (
        <Truck
          size={32}
          fill="currentColor"
          fillOpacity={0.2}
          strokeWidth={2.5}
        />
      ) : type === "medical" ? (
        <Activity size={32} strokeWidth={3} />
      ) : (
        <MapPin size={32} fill="currentColor" fillOpacity={0.2} />
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
};

export const Map = ({
  markers = [],
  lines = [],
  center = { lat: 21.0285, lng: 105.8542 },
  zoom = 13,
}: MapProps) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
      className="z-0" // Ensure map stays behind overlays
    >
      {/* Dark Matter Tiles for "Beautiful/Premium" look matching Dark Mode */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {lines?.map((l, idx) => (
        <Polyline
          key={idx}
          positions={[
            [l.from.lat, l.from.lng],
            [l.to.lat, l.to.lng],
          ]}
          pathOptions={{
            color: l.color || "cyan",
            dashArray: "10, 10",
            weight: 3,
            opacity: 0.7,
          }}
        />
      ))}

      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={createCustomIcon(m.color || "#FBBC04", m.type)}
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
