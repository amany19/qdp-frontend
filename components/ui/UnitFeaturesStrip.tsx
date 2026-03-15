'use client';

import React from 'react';
import Image from 'next/image';

export interface UnitFeaturesStripProps {
  /** Unit label e.g. "204B" – will be shown as "وحدة رقم {unitTitle}" in the dark bar */
  unitTitle: string;
  kitchenLabel?: string;
  bathroomsLabel?: string;
  bedroomsLabel?: string;
  areaLabel?: string;
  className?: string;
}

const defaultKitchen = '1 مطبخ';
const defaultBathrooms = 'حمام';
const defaultBedrooms = 'غرف';
const defaultArea = 'متر';

const circleStyle = {
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' as const,
};

export default function UnitFeaturesStrip({
  unitTitle,
  kitchenLabel = defaultKitchen,
  bathroomsLabel = defaultBathrooms,
  bedroomsLabel = defaultBedrooms,
  areaLabel = defaultArea,
  className = '',
}: UnitFeaturesStripProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} dir="rtl">
      {/* Unit identifier: white background, no outline, building icon + "وحدة رقم {title}" */}
      <div className="bg-white rounded-xl flex items-center gap-2 px-4 py-3">
        <Image
          src="/icons/building-icon.svg"
          alt=""
          width={20}
          height={20}
          className="shrink-0"
        />
        <span className="text-[#1A1A1A] font-medium text-sm">
          وحدة رقم {unitTitle}
        </span>
      </div>

      {/* Four feature circles: Kitchen, Bathroom, Bedroom, Area – light beige with subtle inset, labels under each */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#F3F1EB] border border-[#E8E4DC]"
            style={circleStyle}
          >
            <Image src="/icons/lucide_cooking-pot.svg" alt="مطبخ" width={24} height={24} />
          </div>
          <span className="text-xs text-[#000]">{kitchenLabel}</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#F3F1EB] border border-[#E8E4DC]"
            style={circleStyle}
          >
            <Image src="/icons/bathroom.svg" alt="حمام" width={24} height={24} />
          </div>
          <span className="text-xs text-[#000]">{bathroomsLabel}</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#F3F1EB] border border-[#E8E4DC]"
            style={circleStyle}
          >
            <Image src="/icons/ion_bed-outline.svg" alt="غرف" width={24} height={24} />
          </div>
          <span className="text-xs text-[#000]">{bedroomsLabel}</span>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#F3F1EB] border border-[#E8E4DC]"
            style={circleStyle}
          >
            <Image src="/icons/area.svg" alt="المساحة" width={24} height={24} />
          </div>
          <span className="text-xs text-[#000]">{areaLabel}</span>
        </div>
      </div>
    </div>
  );
}
