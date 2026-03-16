'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PropertyListing, ApplianceListingItem } from '@/types/profile';
import { getUploadImageUrl } from '@/lib/config';
import { MapPin, Monitor } from 'lucide-react';

interface AdsTabProps {
  ads: PropertyListing[];
  deviceAds?: ApplianceListingItem[];
  loading: boolean;
}

export default function AdsTab({ ads, deviceAds = [], loading }: AdsTabProps) {
  const router = useRouter();
  const hasAnyAds = ads.length > 0 || deviceAds.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!hasAnyAds) {
    return <EmptyAdsState />;
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdCard key={ad._id} ad={ad} />
      ))}
      {deviceAds.map((deviceAd) => (
        <DeviceAdCard key={deviceAd._id} deviceAd={deviceAd} />
      ))}

      {/* Add new ads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AddPropertyButton />
        <AddDeviceButton />
      </div>
    </div>
  );
}

// Sub-components for AdsTab

function EmptyAdsState() {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <p className="text-gray-500 mb-4">لا توجد إعلانات حتى الآن</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/add-property/step-1')}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          إعلان عقار
        </button>
        <button
          onClick={() => router.push('/add-device')}
          className="bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors border border-gray-600"
        >
          إعلان جهاز
        </button>
      </div>
    </div>
  );
}

/** API returns listing with propertyId populated; support both shapes for display and link. */
function AdCard({ ad }: { ad: PropertyListing & { propertyId?: { _id?: string; title?: string; titleAr?: string; status?: string; images?: Array<{ url: string; isCover?: boolean }>; location?: { city?: string; area?: string }; price?: number; category?: string; specifications?: { areaSqm?: number; bedrooms?: number; bathrooms?: number } } } }) {
  const router = useRouter();
  const prop = ad.propertyId && typeof ad.propertyId === 'object' ? ad.propertyId : null;
  const propertyId = prop?._id ?? (typeof (ad as any).propertyId === 'string' ? (ad as any).propertyId : null);
  const title = prop?.title ?? ad.title;
  const titleAr = prop?.titleAr ?? ad.titleAr;
  const images = prop?.images ?? ad.images ?? [];
  const location = prop?.location ?? ad.location;
  const price = prop?.price ?? ad.price;
  const listingType = prop?.category ?? (ad as any).listingType;
  const specs = prop?.specifications;
  const area = specs?.areaSqm ?? ad.area;
  const bedrooms = specs?.bedrooms ?? ad.bedrooms;
  const bathrooms = specs?.bathrooms ?? ad.bathrooms;
  // Default status for user-created property: show "pending admin approval" when property is pending
  const displayStatus = prop?.status === 'pending' ? 'pending_approval' : ad.status;

  const coverImage = Array.isArray(images) && images.length > 0
    ? (images.find((img: { isCover?: boolean }) => img.isCover) || images[0])
    : undefined;
  const imageSrc = coverImage?.url
    ? (coverImage.url.startsWith('http') ? coverImage.url : getUploadImageUrl(coverImage.url))
    : '';

  return (
    <div
      onClick={() => {
        const id = propertyId || ad._id;
        if (id) router.push(`/property/${id}`);
      }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Property Image */}
      <div className="relative h-48 w-full bg-gray-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={titleAr || title || 'عقار'}
            fill
            className="object-cover"
            unoptimized
          />
        ) : null}
        <div className="absolute top-3 right-3">
          <StatusBadge status={displayStatus} />
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-gray-900">
          {titleAr || title || 'إعلان عقار'}
        </h3>

        {location && (location.area || location.city) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {[location.area, location.city].filter(Boolean).join('، ') || '—'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {area != null && <span>{area} متر</span>}
            {bedrooms != null && <span>{bedrooms} غرف</span>}
            {bathrooms != null && <span>{bathrooms} حمام</span>}
          </div>
          {price != null && (
            <div className="text-lg font-bold text-gray-900">
              {Number(price).toLocaleString('ar-QA')} ريال
            </div>
          )}
        </div>

        {listingType && (
          <div className="flex items-center gap-2 pt-2">
            <ListingTypeBadge type={listingType} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Badge config: listing statuses from backend (pending, active, expired, cancelled, rejected) + pending_approval when property is pending */
const STATUS_BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'نشط' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'بانتظار الدفع' },
  pending_approval: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مسودة' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'غير نشط' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'منتهي' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'ملغى' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
};

function StatusBadge({ status }: { status: PropertyListing['status'] }) {
  const resolved = STATUS_BADGE_CONFIG[status] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: status || '—',
  };
  const { bg, text, label } = resolved;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

const LISTING_TYPE_BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  rent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'للإيجار' },
  sale: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'للبيع' },
  both: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'إيجار وبيع' },
};

function ListingTypeBadge({ type }: { type: string }) {
  const resolved = LISTING_TYPE_BADGE_CONFIG[type] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: type || '—',
  };
  const { bg, text, label } = resolved;

  return (
    <span className={`text-xs px-2 py-1 rounded ${bg} ${text}`}>
      {label}
    </span>
  );
}

function DeviceAdCard({ deviceAd }: { deviceAd: ApplianceListingItem }) {
  const router = useRouter();
  const appliance = deviceAd.applianceId;
  const rawId = typeof appliance === 'object' && appliance !== null && '_id' in appliance
    ? (appliance as { _id: string })._id
    : deviceAd.applianceId;
  const applianceId = rawId != null ? String(rawId) : '';
  const nameAr = typeof appliance === 'object' && appliance !== null && 'nameAr' in appliance
    ? (appliance as { nameAr: string }).nameAr
    : '';
  const images = typeof appliance === 'object' && appliance !== null && 'images' in appliance
    ? (appliance as { images?: string[] }).images
    : undefined;
  const firstImageUrl = getUploadImageUrl(images?.[0]);

  return (
    <div
      onClick={() => { if (applianceId) router.push(`/appliances/${applianceId}`); }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center">
        {firstImageUrl ? (
          <Image
            src={firstImageUrl}
            alt={nameAr || 'جهاز'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        ) : (
          <Monitor className="w-16 h-16 text-gray-400" />
        )}
        <div className="absolute top-3 right-3">
          <DeviceStatusBadge status={deviceAd.status} />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-gray-900">{nameAr || 'جهاز للإيجار'}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">جهاز</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            {deviceAd.totalCost != null ? `${Number(deviceAd.totalCost).toLocaleString('ar-QA')} ريال` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

function DeviceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'نشط' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'منتهي' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'ملغى' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
  };
  const { bg, text, label } = config[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function AddPropertyButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/add-property/step-1')}
      className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-2xl">+</span>
        </div>
        <span className="font-medium">إعلان عقار</span>
      </div>
    </button>
  );
}

function AddDeviceButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/add-device')}
      className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Monitor className="w-6 h-6" />
        </div>
        <span className="font-medium">إعلان جهاز</span>
      </div>
    </button>
  );
}