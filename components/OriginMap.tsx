"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Custom minimal dark marker
const createIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 14px;
      height: 14px;
      background: #171717;
      border: 2.5px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

export interface MapStory {
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

  const icon = createIcon();

  return (
    <div className="w-full h-[420px]">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={3}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#f5f5f5" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        {pinned.map((story) => (
          <Marker
            key={story.id}
            position={[story.latitude!, story.longitude!]}
            icon={icon}
          >
            <Popup closeButton={false} className="custom-popup">
              <Link
                href={`/story/${story.id}`}
                className="block px-1 py-0.5 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
              >
                {story.title} →
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}