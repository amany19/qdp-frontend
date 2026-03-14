'use client';

import React from 'react';
import {
  BuildingIcon,
  ChefHatIcon,
  BathIcon,
  BedIcon,
  RulerIcon,
} from '@/components/icons';

export interface UnitFeaturesStripProps {
  /** Unit label e.g. "وحدة رقم 204B" */
  unitTitle: string;
  /** Optional: show values under icons (e.g. "١ مطبخ", "٢ حمام") */
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

export default function UnitFeaturesStrip({
  unitTitle,
  kitchenLabel = defaultKitchen,
  bathroomsLabel = defaultBathrooms,
  bedroomsLabel = defaultBedrooms,
  areaLabel = defaultArea,
  className = '',
}: UnitFeaturesStripProps) {
  const circleBase =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200/80 text-gray-700';
  const iconSize = { width: 22, height: 22 };

  return (
    <div className={`flex flex-col gap-3 ${className}`} dir="rtl">
      {/* Unit identifier: title + building icon (right-aligned in RTL) */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-base font-semibold text-gray-900">{unitTitle}</span>
        <span className="flex h-6 w-6 items-center justify-center text-gray-600 [&_path]:fill-current">
          <BuildingIcon className="h-5 w-5" />
        </span>
      </div>

      {/* Row of 4 feature circles: kitchen, bathroom, bedroom, area */}
      <div className="flex flex-row gap-3 justify-end flex-wrap text-gray-700 [&_path]:stroke-current [&_path]:fill-none">
        <div className={circleBase} title={kitchenLabel}>
          <ChefHatIcon className="h-[22px] w-[22px]" />
        </div>
        <div className={circleBase} title={bathroomsLabel}>
          <BathIcon className="h-[22px] w-[22px]" />
        </div>
        <div className={circleBase} title={bedroomsLabel}>
          <BedIcon className="h-[22px] w-[22px]" />
        </div>
        <div className={circleBase} title={areaLabel}>
          <RulerIcon className="h-[22px] w-[22px]" />
        </div>
      </div>
    </div>
  );
}
