'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseGoogleMapsLink } from '@/lib/parseGoogleMapsLink';
import { Link2, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const DOHA_CENTER: [number, number] = [25.2854, 51.5074];

export interface LocationCoords {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LocationCoords | null;
  onChange: (coords: LocationCoords | null) => void;
  height?: string;
}

function CreateMarker({ position, onChange }: { position: [number, number]; onChange: (c: LocationCoords) => void }) {
  const map = useMapEvents({});
  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const pos = e.target.getLatLng();
          onChange({ lat: pos.lat, lng: pos.lng });
        },
      }}
      icon={L.divIcon({
        className: '',
        html: `<div style="display:flex;justify-content:center;align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#2563EB">
            <path d="M12 21C12 21 4 13 4 8a8 8 0 1116 0c0 5-8 13-8 13z"/>
            <circle cx="12" cy="8" r="3" fill="white"/>
          </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })}
    />
  );
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center[0], center[1], zoom]);
  return null;
}

export default function LocationPicker({ value, onChange, height = '220px' }: LocationPickerProps) {
  const [mapLink, setMapLink] = useState('');
  const [mounted, setMounted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const center: [number, number] = value ? [value.lat, value.lng] : DOHA_CENTER;

  const handleExtractFromLink = useCallback(() => {
    const coords = parseGoogleMapsLink(mapLink);
    if (coords) {
      onChange(coords);
      toast.success('تم استخراج الموقع');
    } else {
      toast.error('رابط خريطة غير صالح. الصق رابط مشاركة من Google Maps.');
    }
  }, [mapLink, onChange]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({ lat, lng });
        toast.success('تم استخدام موقعك الحالي');
        setGettingLocation(false);
      },
      () => {
        toast.error('تعذر الحصول على الموقع. تحقق من صلاحيات الموقع.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onChange]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onChange({ lat, lng });
    },
    [onChange]
  );

  if (!mounted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-100 animate-pulse" style={{ height }} />
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Google Map link */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5 text-right">
          رابط Google Maps (اختياري)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            placeholder="الصق رابط مشاركة الموقع من خرائط جوجل"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-right text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleExtractFromLink}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
          >
            <Link2 className="w-4 h-4" />
            استخراج الموقع
          </button>
        </div>
      </div>

      {/* Use current location */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={gettingLocation}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-60"
      >
        <Navigation className="w-4 h-4" />
        {gettingLocation ? 'جاري تحديد الموقع...' : 'استخدام موقعي الحالي'}
      </button>

      {/* Map picker */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5 text-right">
          أو انقر على الخريطة لتحديد الموقع
        </label>
        <div
          className="rounded-xl overflow-hidden border border-gray-200"
          style={{ height }}
        >
          <MapContainer
            center={center}
            zoom={value ? 15 : 12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
            <ChangeView center={center} zoom={value ? 15 : 12} />
            <MapClickHandler onMapClick={handleMapClick} />
            {value && <CreateMarker position={[value.lat, value.lng]} onChange={onChange} />}
          </MapContainer>
        </div>
        {value && (
          <p className="text-xs text-gray-500 mt-1 text-right">
            الإحداثيات: {value.lat.toFixed(5)}، {value.lng.toFixed(5)} — اسحب المؤشر لتعديل الموقع
          </p>
        )}
      </div>
    </div>
  );
}
