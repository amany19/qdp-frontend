'use client';

import { SearchPropertyCard } from '@/components/ui/SearchPropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/PropertyCardSkeleton';

interface Property {
  _id: string;
  title?: string;
  propertyType?: string;
  category?: string;
  price?: number;
  currency?: string;
  specifications?: {
    bedrooms?: number;
    bathrooms?: number;
    areaSqm?: number;
    kitchen?: number;
  };
  location?: { area?: string; city?: string };
  images?: { url: string; isCover?: boolean }[];
  isQDP?: boolean;
  isFavorited?: boolean;
  availableFor?: Record<string, unknown>;
  [key: string]: unknown;
}

interface HomeFeaturedPropertiesProps {
  data?: Property[] | { data?: Property[]; properties?: Property[] };
  isLoading: boolean;
}

export default function HomeFeaturedProperties({
  data,
  isLoading,
}: HomeFeaturedPropertiesProps) {
  // Backend returns { properties, total, page, totalPages }; support array or { data } too
  const list = Array.isArray(data)
    ? data
    : (data as { properties?: Property[] })?.properties ??
      (data as { data?: Property[] })?.data ??
      [];

  if (isLoading) {
    return (
      <div className="px-4 overflow-x-auto hide-scrollbar flex gap-4 pb-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[280px] flex-shrink-0">
            <PropertyCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!list?.length) {
    return (
      <div className="px-4 py-6 text-center text-gray-500 text-sm">
        لا توجد وحدات مميزة حالياً
      </div>
    );
  }

  return (
    <div className="px-4 overflow-x-auto hide-scrollbar flex gap-4 pb-2">
      {list.map((property, index) => (
        <div key={property._id} className="min-w-[280px] flex-shrink-0">
          <SearchPropertyCard
            property={property as Parameters<typeof SearchPropertyCard>[0]['property']}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
