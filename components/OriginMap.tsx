"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapStory {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
}

export default function OriginMap({ stories }: { stories: MapStory[] }) {
  const pinned = stories.filter(
    (s) => s.latitude !== null && s.longitude !== null
  );

  if (pinned.length === 0) return null;

  const avgLat =
    pinned.reduce((sum, s) => sum + (s.latitude ?? 0), 0) / pinned.length;
  const avgLng =
    pinned.reduce((sum, s) => sum + (s.longitude ?? 0), 0) / pinned.length;

  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={3}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        {pinned.map((story) => (
          <Marker
            key={story.id}
            position={[story.latitude!, story.longitude!]}
            icon={icon}
          >
            <Popup>
              <span className="font-medium text-sm">{story.title}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}