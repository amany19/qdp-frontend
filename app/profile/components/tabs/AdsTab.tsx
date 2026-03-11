'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PropertyListing } from '@/types/profile';
import { MapPin } from 'lucide-react';

interface AdsTabProps {
  ads: PropertyListing[];
  loading: boolean;
}

export default function AdsTab({ ads, loading }: AdsTabProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return <EmptyAdsState />;
  }

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <AdCard key={ad._id} ad={ad} />
      ))}

      {/* Add New Ad Button */}
      <AddAdButton />
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
      <button
        onClick={() => router.push('/add-property/step-1')}
        className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        إضافة إعلان جديد
      </button>
    </div>
  );
}

function AdCard({ ad }: { ad: PropertyListing }) {
  const router = useRouter();
  
  const coverImage = ad.images.find((img) => img.isCover) || ad.images[0];

  return (
    <div
      onClick={() => router.push(`/property/${ad._id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Property Image */}
      <div className="relative h-48 w-full bg-gray-200">
        {coverImage && (
          <Image
            src={coverImage.url}
            alt={ad.titleAr || ad.title}
            fill
            className="object-cover"
          />
        )}
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={ad.status} />
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-gray-900">
          {ad.titleAr || ad.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            {ad.location.area}, {ad.location.city}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{ad.area} متر</span>
            <span>{ad.bedrooms} غرف</span>
            <span>{ad.bathrooms} حمام</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {ad.price.toLocaleString('ar-QA')} ريال
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <ListingTypeBadge type={ad.listingType} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PropertyListing['status'] }) {
  const config = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'نشط' },
    pending_approval: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مسودة' },
    inactive: { bg: 'bg-red-100', text: 'text-red-700', label: 'غير نشط' },
  };

  const { bg, text, label } = config[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function ListingTypeBadge({ type }: { type: 'rent' | 'sale' }) {
  const config = {
    rent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'للإيجار' },
    sale: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'للبيع' },
  };

  const { bg, text, label } = config[type];

  return (
    <span className={`text-xs px-2 py-1 rounded ${bg} ${text}`}>
      {label}
    </span>
  );
}

function AddAdButton() {
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
        <span className="font-medium">إضافة إعلان جديد</span>
      </div>
    </button>
  );
}