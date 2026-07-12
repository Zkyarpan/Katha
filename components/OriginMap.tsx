"use client";

import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

// ── Pulsing pin marker ────────────────────────────────────────────────────────
const createIcon = () =>
  L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          position:absolute;inset:0;
          background:rgba(124,92,216,0.25);
          border-radius:50%;
          animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;top:3px;left:3px;
          width:14px;height:14px;
          background:#7c3aed;
          border:2.5px solid #fff;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(124,58,237,0.4);
        "></div>
      </div>`,
    iconSize:    [20, 20],
    iconAnchor:  [10, 10],
    popupAnchor: [0, -14],
  });

// ── Inner component that can access the map instance ─────────────────────────
function MapContent({ stories }: { stories: MapStory[] }) {
  const map  = useMap();
  const icon = createIcon();

  // Fit all pins into view on first load
  useEffect(() => {
    if (stories.length === 0) return;
    const bounds = L.latLngBounds(
      stories.map((s) => [s.latitude!, s.longitude!] as [number, number])
    );
    // Pad so pins aren't at the very edge; maxZoom:5 keeps a world-level view
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 5, animate: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* CartoDB Voyager — clean, labelled, Google Maps-like style; no API key */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
        keepBuffer={4}
        updateWhenIdle={true}
        updateWhenZooming={false}
      />
      {stories.map((story) => (
        <Marker
          key={story.id}
          position={[story.latitude!, story.longitude!]}
          icon={icon}
        >
          <Popup
            closeButton={false}
            className="custom-popup"
            autoPan={false}
          >
            <Link
              href={`/story/${story.id}`}
              className="block px-1 py-0.5 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors whitespace-nowrap"
            >
              {story.title} →
            </Link>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ── FitBoundsButton — resets view to show all pins ────────────────────────────
function FitBoundsButton({ stories }: { stories: MapStory[] }) {
  const map      = useMap();
  const [spin,   setSpin] = useState(false);

  const handleReset = useCallback(() => {
    setSpin(true);
    const bounds = L.latLngBounds(
      stories.map((s) => [s.latitude!, s.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 5 });
    setTimeout(() => setSpin(false), 600);
  }, [map, stories]);

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "52px" }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleReset}
          title="Reset view"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            background: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <RefreshCw
            size={14}
            style={{
              color: "#555",
              transition: "transform 0.6s ease",
              transform: spin ? "rotate(360deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>
    </div>
  );
}

// ── Public interface ──────────────────────────────────────────────────────────
export interface MapStory {
  id: string;
  title: string;
  latitude:  number | null;
  longitude: number | null;
}

export default function OriginMap({ stories }: { stories: MapStory[] }) {
  const pinned = stories.filter(
    (s) => s.latitude !== null && s.longitude !== null
  ) as (MapStory & { latitude: number; longitude: number })[];

  if (pinned.length === 0) return null;

  // World-centre fallback if bounds calculation isn't ready yet
  const initCenter: [number, number] = [20, 80];
  const initZoom = 2;

  return (
    <>
      {/* Keyframe for the pulse animation — injected once per page */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          padding: 0 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          border: 1px solid #e5e7eb !important;
        }
        .leaflet-popup-content {
          margin: 8px 12px !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255,255,255,0.7) !important;
        }
      `}</style>

      <div className="w-full h-[480px] rounded-xl overflow-hidden">
        <MapContainer
          center={initCenter}
          zoom={initZoom}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
          style={{ height: "100%", width: "100%", background: "#f0ede8" }}
          // Prevent the map from re-initialising on every parent re-render
          id="katha-origin-map"
        >
          <MapContent stories={pinned} />
          <FitBoundsButton stories={pinned} />
        </MapContainer>
      </div>
    </>
  );
}
