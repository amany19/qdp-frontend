'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SERVER_BASE_URL } from '@/lib/config';

interface Property {
  _id: string;
  title: string;
  propertyType: string;
  category: string;
  price: number;
  currency: string;
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    kitchen?: number;
  };
  location: {
    area: string;
    city: string;
  };
  images: { url: string; isCover: boolean }[];
  isQDP?: boolean;
  isFavorited?: boolean;
  availableFor?: {
    rent: boolean;
    sale: boolean;
    rentPrice?: number;
    salePrice?: number;
    contractDuration?: number;
    numberOfInstallments?: number;
    insuranceDeposit?: number;
  };
}

interface SearchPropertyCardProps {
  property: Property;
}

export function SearchPropertyCard({ property }: SearchPropertyCardProps) {
  const router = useRouter();
  const images = property.images ?? [];
  const coverImage = images.find((img) => img.isCover) || images[0];
  const imageSrc = coverImage?.url
    ? coverImage.url.startsWith('http')
      ? coverImage.url
      : `${SERVER_BASE_URL}${coverImage.url}`
    : '';

  const handleCardClick = () => {
    router.push(`/property/${property._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full cursor-pointer"
      dir="rtl"
    >
      {/* Property Image */}
      <div className="relative w-full h-[240px] rounded-[5px] overflow-hidden">
        {coverImage && imageSrc ? (
          <Image
            src={imageSrc}
            alt={property.title ?? 'Property'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}
      </div>

      {/* White Container at Bottom */}
      <div className="absolute bottom-2 left-2 right-2 bg-white rounded-[5px] p-3 space-y-2">
        {/* Row 1: Title and Source Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 font-semibold text-sm">
            {property.title}
          </h3>
          <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-semibold">
            {property.isQDP ? 'QDP' : 'خارجي'}
          </div>
        </div>

        {/* Row 2: Location */}
        {property.location && (
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <img src="/icons/location.svg" alt="location" width={13} height={13} className="w-3 h-3" />
            <span>
              {property.location.area && property.location.city
                ? `${property.location.area}، ${property.location.city}`
                : property.location.area || property.location.city || 'الموقع غير محدد'
              }
            </span>
          </div>
        )}

        {/* Row 3: Specifications */}
        {property.specifications && (
          <div className="flex items-center gap-3">
            {/* Bedrooms */}
            <div className="flex items-center gap-1">
              <img src="/icons/ion_bed-outline.svg" alt="bedrooms" width={16} height={16} className="w-4 h-4" />
              <span className="text-gray-900 text-xs font-medium">{property.specifications.bedrooms ?? '—'}</span>
            </div>

            {/* Bathrooms */}
            <div className="flex items-center gap-1">
              <img src="/icons/bathroom.svg" alt="bathrooms" width={14} height={13} className="w-4 h-4" />
              <span className="text-gray-900 text-xs font-medium">{property.specifications.bathrooms ?? '—'}</span>
            </div>

            {/* Kitchen */}
            {property.specifications.kitchen && property.specifications.kitchen > 0 && (
              <div className="flex items-center gap-1">
                <img src="/icons/lucide_cooking-pot.svg" alt="kitchen" width={16} height={16} className="w-4 h-4" />
                <span className="text-gray-900 text-xs font-medium">{property.specifications.kitchen}</span>
              </div>
            )}

            {/* Area */}
            <div className="flex items-center gap-1">
              <img src="/icons/area.svg" alt="area" width={13} height={13} className="w-4 h-4" />
              <span className="text-gray-900 text-xs font-medium">
                {property.specifications.areaSqm != null ? `${property.specifications.areaSqm.toLocaleString()} م²` : '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
