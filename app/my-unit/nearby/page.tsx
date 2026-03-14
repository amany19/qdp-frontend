'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { nearbyService, type NearbyPlace } from '@/services/nearbyService';
import { MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

const FACILITY_STYLES: Record<string, { label: string; badgeClass: string; tabClass: string }> = {
  hospital: { label: 'مستشفى', badgeClass: 'bg-red-50 text-red-700 border border-red-100', tabClass: 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100' },
  pharmacy: { label: 'صيدلية', badgeClass: 'bg-rose-50 text-rose-700 border border-rose-100', tabClass: 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100' },
  school: { label: 'مدرسة', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100', tabClass: 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100' },
  restaurant: { label: 'مطعم', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100', tabClass: 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100' },
  cafe: { label: 'كافيه', badgeClass: 'bg-orange-50 text-orange-700 border border-orange-100', tabClass: 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100' },
  mall: { label: 'مول', badgeClass: 'bg-violet-50 text-violet-700 border border-violet-100', tabClass: 'bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100' },
  park: { label: 'حديقة', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100', tabClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' },
  gym: { label: 'مركز رياضي', badgeClass: 'bg-sky-50 text-sky-700 border border-sky-100', tabClass: 'bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100' },
  amenity: { label: 'مرافق', badgeClass: 'bg-slate-50 text-slate-600 border border-slate-100', tabClass: 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100' },
  shop: { label: 'متجر', badgeClass: 'bg-teal-50 text-teal-700 border border-teal-100', tabClass: 'bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100' },
  leisure: { label: 'ترفيه', badgeClass: 'bg-lime-50 text-lime-700 border border-lime-100', tabClass: 'bg-lime-50 text-lime-700 border border-lime-100 hover:bg-lime-100' },
};
const DEFAULT_STYLE = { label: 'مكان', badgeClass: 'bg-gray-50 text-gray-600 border border-gray-100', tabClass: 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100' };
function getFacilityStyle(type?: string) {
  if (!type) return DEFAULT_STYLE;
  return FACILITY_STYLES[type.toLowerCase()] ?? { ...DEFAULT_STYLE, label: type };
}

const ALL_TAB = 'all';

export default function MyUnitNearbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  const { data: places = [], isLoading } = useQuery<NearbyPlace[]>({
    queryKey: ['nearby-by-property', propertyId],
    queryFn: () => nearbyService.getNearbyByProperty(propertyId!),
    enabled: !!propertyId,
  });

  const tabs = useMemo(() => {
    const types = new Set(places.map((p) => (p.type ?? '').toLowerCase()).filter(Boolean));
    const tabList: { id: string; label: string; tabClass: string }[] = [
      { id: ALL_TAB, label: 'الكل', tabClass: 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100' },
    ];
    types.forEach((t) => {
      const style = getFacilityStyle(t);
      tabList.push({ id: t, label: style.label, tabClass: style.tabClass });
    });
    return tabList;
  }, [places]);

  const filteredPlaces = useMemo(() => {
    if (activeTab === ALL_TAB) return places;
    return places.filter((p) => (p.type ?? '').toLowerCase() === activeTab);
  }, [places, activeTab]);

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <HeaderCard
          title="المرافق القريبة من وحدتي"
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
          <p className="text-gray-500 text-sm">لم يتم تحديد الوحدة. ارجع لوحدتي.</p>
          <button
            type="button"
            onClick={() => router.push('/my-unit')}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium"
          >
            وحدتي
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <HeaderCard
        title="المرافق القريبة من وحدتي"
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

      <div className="p-4 pt-2 min-h-screen bg-white">
        <p className="text-xs text-gray-500 mb-3">حسب موقع وحدتك   </p>
        {!isLoading && places.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-3 mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeTab === tab.id ? 'ring-2 ring-offset-2 ring-emerald-500' : ''} ${tab.tabClass}`}
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
              const style = getFacilityStyle(place.type);
              return (
                <a
                  key={`${place.lat}-${place.lng}-${index}`}
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[88px] hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] transition-all"
                >
                  <div className="flex justify-start pt-3 px-4 pb-1">
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-xl border ${style.badgeClass}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 pb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                        <MapPin className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">انقر لفتح الموقع في خرائط جوجل</p>
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
      {/* <BottomNavigation /> */}
    </div>
  );
}
