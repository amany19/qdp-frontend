"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

interface MapPreviewProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  className?: string;
}

export default function MapPreview({
  lat,
  lng,
  zoom = 16,
  height = "140px",
  className = "",
}: MapPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div
        className={`w-full bg-gray-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500 text-sm text-center">الموقع غير متاح</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div
        className={`w-full bg-gray-100 rounded-xl animate-pulse ${className}`}
        style={{ height }}
      />
    );
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Leaflet DivIcon with simple filled dark red pin (no border)
  const markerIcon = new DivIcon({
    className: "",
    html: `
      <div style="display:flex;justify-content:center;align-items:center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#8B0000">
          <path d="M12 21C12 21 4 13 4 8a8 8 0 1116 0c0 5-8 13-8 13z"/>
          <circle cx="12" cy="8" r="3" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  return (
    <div className="w-full">
      <div
        className={`w-full rounded-xl overflow-hidden relative z-0 group cursor-pointer shadow-sm border border-gray-200 ${className}`}
        style={{ height }}
        onClick={openGoogleMaps}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />

          <Marker position={[lat, lng]} icon={markerIcon} />
        </MapContainer>
      </div>

      {/* <div className="text-[10px] text-gray-400 text-right mt-1">
        © OpenStreetMap contributors
      </div> */}
    </div>
  );
}