"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------------------------
// OriginMap
// Renders a Leaflet map with a pin for each story that has coordinates.
// ---------------------------------------------------------------------------

// Fix the default Leaflet marker icon paths, which break in Next.js because
// the bundler rewrites asset URLs and Leaflet resolves them at runtime using
// its own internal path logic instead of going through the module system.
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export interface MapStory {
  id: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
}

interface OriginMapProps {
  stories: MapStory[];
}

export default function OriginMap({ stories }: OriginMapProps) {
  // Apply the icon fix once on mount, client-side only.
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // Only stories with valid coordinates get a pin.
  const pinned = stories.filter(
    (s): s is MapStory & { latitude: number; longitude: number } =>
      s.latitude !== null && s.longitude !== null
  );

  // Center on the average position of all pinned stories, or fall back to a
  // world-overview center if none exist.
  const center: [number, number] =
    pinned.length > 0
      ? [
          pinned.reduce((sum, s) => sum + s.latitude, 0) / pinned.length,
          pinned.reduce((sum, s) => sum + s.longitude, 0) / pinned.length,
        ]
      : [20, 0];

  const zoom = pinned.length > 0 ? 4 : 2;

  return (
    <div className="rounded-2xl overflow-hidden border border-katha-plum/40 h-[400px]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {pinned.map((story) => (
          <Marker
            key={story.id}
            position={[story.latitude, story.longitude]}
          >
            <Popup>
              <span className="font-medium">{story.title}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
