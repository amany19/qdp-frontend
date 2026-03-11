'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useLocationStore } from '@/store/locationStore';
import { nearbyService } from '@/services/nearbyService';
import { MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';

type NearbyPlace = {
  name: string;
  type?: string;
  lat: number;
  lng: number;
};

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Facility type -> Arabic label and badge colors (bg, text)
const FACILITY_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  hospital: { label: 'مستشفى', className: 'bg-red-100 text-red-800' },
  pharmacy: { label: 'صيدلية', className: 'bg-rose-100 text-rose-800' },
  school: { label: 'مدرسة', className: 'bg-blue-100 text-blue-800' },
  restaurant: { label: 'مطعم', className: 'bg-amber-100 text-amber-800' },
  cafe: { label: 'كافيه', className: 'bg-orange-100 text-orange-800' },
  mall: { label: 'مول', className: 'bg-violet-100 text-violet-800' },
  park: { label: 'حديقة', className: 'bg-emerald-100 text-emerald-800' },
  gym: { label: 'مركز رياضي', className: 'bg-sky-100 text-sky-800' },
  amenity: { label: 'مرافق', className: 'bg-slate-100 text-slate-700' },
  shop: { label: 'متجر', className: 'bg-teal-100 text-teal-800' },
  leisure: { label: 'ترفيه', className: 'bg-lime-100 text-lime-800' },
};

function getTypeBadge(type?: string): { label: string; className: string } {
  if (!type) return { label: 'مكان', className: 'bg-gray-100 text-gray-700' };
  const key = type.toLowerCase();
  return FACILITY_TYPE_STYLES[key] ?? { label: type, className: 'bg-gray-100 text-gray-700' };
}

const ALL_TAB = 'all';

export default function NearbyFacilitiesPage() {
  const router = useRouter();
  const { lat, lng, city } = useLocationStore();
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  const { data: places = [], isLoading } = useQuery<NearbyPlace[]>({
    queryKey: ['nearby', lat, lng],
    queryFn: () => nearbyService.getNearby(lat!, lng!),
    enabled: !!lat && !!lng,
  });

  const tabs = useMemo(() => {
    const types = new Set(places.map((p) => (p.type ?? '').toLowerCase()).filter(Boolean));
    const tabList: { id: string; label: string; className: string }[] = [
      { id: ALL_TAB, label: 'الكل', className: 'bg-gray-100 text-gray-800' },
    ];
    types.forEach((t) => {
      const style = FACILITY_TYPE_STYLES[t];
      if (style) tabList.push({ id: t, label: style.label, className: style.className });
      else tabList.push({ id: t, label: t, className: 'bg-gray-100 text-gray-700' });
    });
    return tabList;
  }, [places]);

  const filteredPlaces = useMemo(() => {
    if (activeTab === ALL_TAB) return places;
    return places.filter((p) => (p.type ?? '').toLowerCase() === activeTab);
  }, [places, activeTab]);

  if (!lat || !lng) {
    return (
      <div className="min-h-screen " dir="rtl">
        <HeaderCard
          title="الخدمات القريبة"
          leftButton={
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>
          }
        />
        <div className="flex flex-col items-center justify-center flex-1 py-12 px-4">
          <p className="text-gray-500 text-sm">يرجى تحديد الموقع أولاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8" dir="rtl">
      {/* Header - same HeaderCard as other pages, no notification icon */}
      <HeaderCard
        title="الخدمات القريبة"
        leftButton={
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-gray-900" />
          </button>
        }
      />

      <div className="p-4 pt-2">
      {/* Tab filters - wrap to multiple rows, each tab uses its badge color */}
      {!isLoading && places.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2 mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'ring-2 ring-offset-2 ring-gray-800 ' : ''
              }${tab.className}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-sm text-gray-500">جاري تحميل المرافق...</p>
        </div>
      ) : places.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">لا توجد مرافق قريبة في نطاق البحث</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">لا توجد نتائج لهذا النوع</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPlaces.map((place, index) => {
            const mapsUrl = getGoogleMapsUrl(place.lat, place.lng);
            const badge = getTypeBadge(place.type);
            return (
              <a
                key={`${place.lat}-${place.lng}-${index}`}
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[88px] hover:border-gray-300 hover:shadow-md active:scale-[0.99] transition-all"
              >
                {/* Top row: badge only (start = right in RTL) */}
                <div className="flex justify-start pt-3 px-4 pb-1">
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                {/* Bottom row: icon + name + link */}
                <div className="flex items-center justify-between gap-3 px-4 pb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {place.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        انقر لفتح الموقع في خرائط جوجل
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
