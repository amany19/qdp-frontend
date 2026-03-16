'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Appliance } from '@/services/appliancesService';
import { getUploadImageUrl } from '@/lib/config';

interface SearchApplianceCardProps {
  appliance: Appliance;
}

export function SearchApplianceCard({ appliance }: SearchApplianceCardProps) {
  const router = useRouter();
  const imageSrc = getUploadImageUrl(appliance.images?.[0]) || '/images/placeholder-appliance.jpg';

  return (
    <div
      className="h-[300px] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer"
      dir="rtl"
    >
      {/* Appliance Image - fixed height */}
      <div className="relative h-36 flex-shrink-0 bg-gray-50">
        <Image
          src={imageSrc}
          alt={appliance.nameAr ?? ''}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />
      </div>

      {/* Content - flex-1 so card height is fixed; text clamped so content doesn't overflow */}
      <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
        <h3 className="font-semibold text-sm text-gray-900 text-right line-clamp-2">
          {appliance.nameAr}
        </h3>
        <p className="text-xs text-gray-600 text-right line-clamp-1 mt-1">
          {appliance.brand}
        </p>
        <button
          onClick={() => router.push(`/appliances/${appliance._id}`)}
          className="w-full py-2 px-4 border border-gray-900 rounded-md text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors mt-auto"
        >
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
