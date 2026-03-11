'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Appliance, getApplianceTypeLabel } from '@/services/appliancesService';

interface ApplianceCardProps {
  appliance: Appliance;
}

export function ApplianceCard({ appliance }: ApplianceCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/appliances/${appliance._id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={appliance.images[0] || '/images/placeholder-appliance.jpg'}
          alt={appliance.nameAr}
          fill
          className="object-cover"
        />
        {/* Badge */}
        <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
          {getApplianceTypeLabel(appliance.applianceType)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-base mb-1 text-right">{appliance.nameAr}</h3>

        {/* Brand and Model */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 justify-end">
          <span>{appliance.brand}</span>
          {appliance.model && (
            <>
              <span>•</span>
              <span>{appliance.model}</span>
            </>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">يبدأ من</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold">{appliance.rentalPrices.oneMonth}</span>
              <span className="text-sm text-gray-600">ر.ق / شهر</span>
            </div>
          </div>

          {/* Color indicator */}
          {appliance.color && (
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">اللون</p>
              <p className="text-sm font-medium">{appliance.color}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
