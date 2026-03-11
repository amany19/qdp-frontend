'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useProperties';

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
    parking?: number;
  };
  location: {
    area: string;
    city: string;
  };
  images: { url: string; isCover: boolean }[];
  isQDP?: boolean;
  isFavorited?: boolean;
  // Dual Purpose Support
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

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: () => void;
  compact?: boolean;
}

export function PropertyCard({ property, onFavoriteToggle, compact = false }: PropertyCardProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const coverImage = property.images.find((img) => img.isCover) || property.images[0];

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorited) {
      await removeFromFavorites.mutateAsync(property._id);
    } else {
      await addToFavorites.mutateAsync(property._id);
    }

    setIsFavorited(!isFavorited);
    onFavoriteToggle?.();
  };

  const handleCardClick = () => {
    router.push(`/property/${property._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      dir="rtl"
    >
      {/* Image */}
      <div className={`relative ${compact ? 'h-40' : 'h-48'}`}>
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}

        {/* Availability Badge - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* QDP or External */}
          <span className={`px-3 py-1 text-xs font-medium rounded ${
            property.isQDP
              ? 'bg-black text-white'
              : 'bg-white text-black'
          }`}>
            {property.isQDP ? 'QDP' : 'خارجي'}
          </span>

          {/* Availability Type */}
          {property.availableFor?.rent && property.availableFor?.sale ? (
            <span className="px-3 py-1 text-xs font-medium rounded bg-gradient-to-r from-blue-500 to-green-500 text-white">
              للإيجار والبيع
            </span>
          ) : property.availableFor?.rent ? (
            <span className="px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white">
              للإيجار
            </span>
          ) : property.availableFor?.sale ? (
            <span className="px-3 py-1 text-xs font-medium rounded bg-green-500 text-white">
              للبيع
            </span>
          ) : (
            // Fallback to old category field
            <span className={`px-3 py-1 text-xs font-medium rounded ${
              property.category === 'rent' ? 'bg-blue-500' : 'bg-green-500'
            } text-white`}>
              {property.category === 'rent' ? 'للإيجار' : 'للبيع'}
            </span>
          )}
        </div>

        {/* Favorite Button - Top Right */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
        >
          {isFavorited ? (
            <span className="text-red-500">❤️</span>
          ) : (
            <span className="text-gray-400">🤍</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className={compact ? 'p-3' : 'p-4'}>
        {/* Title */}
        <h3 className={`font-bold line-clamp-1 ${compact ? 'text-base mb-1' : 'text-lg mb-2'}`}>{property.title}</h3>

        {/* Location with pin icon */}
        <div className={`flex items-center gap-1 text-gray-600 ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{property.location.area}، {property.location.city}</span>
        </div>

        {/* Specifications - Icons with Arabic labels */}
        <div className={`flex items-center text-gray-600 ${compact ? 'gap-2 text-xs mb-2' : 'gap-4 text-sm mb-3'}`}>
          {/* Bedrooms */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
            <span>{property.specifications.bedrooms}</span>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2c-.55 0-1 .45-1 1v.29c-1.42.11-3 .48-3 1.71v1.54c-.15.12-.27.29-.29.46h-.03c-.17 0-.33.08-.43.2s-.15.29-.12.45l.74 3.45c.01.04.02.09.03.13.41 1.37 1.42 2.44 2.73 2.82L7.5 19v1h1v-1h8v1h1v-1h-1.38l-.08-5.96c1.31-.38 2.32-1.45 2.73-2.82.01-.04.02-.09.03-.13l.74-3.45c.03-.16-.02-.33-.12-.45s-.26-.2-.43-.2h-.03c-.02-.17-.14-.34-.29-.46V5c0-1.23-1.58-1.6-3-1.71V3c0-.55-.45-1-1-1H9zm-1 5h9V6h-9v1z"/>
            </svg>
            <span>{property.specifications.bathrooms}</span>
          </div>

          {/* Parking */}
          {property.specifications.parking && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
              </svg>
              <span>{property.specifications.parking}</span>
            </div>
          )}

          {/* Area */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
            </svg>
            <span>{property.specifications.areaSqm.toLocaleString()} متر</span>
          </div>
        </div>

        {/* Price - Show both if available for both */}
        <div>
          {property.availableFor?.rent && property.availableFor?.sale ? (
            // Both rent and sale
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className={`font-bold text-blue-600 ${compact ? 'text-base' : 'text-lg'}`}>
                  {(property.availableFor.rentPrice || property.price).toLocaleString()} ر.ق
                </p>
                <span className={compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>/ شهر (إيجار)</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`font-bold text-green-600 ${compact ? 'text-base' : 'text-lg'}`}>
                  {(property.availableFor.salePrice || property.price).toLocaleString()} ر.ق
                </p>
                <span className={compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>(بيع)</span>
              </div>
            </div>
          ) : property.availableFor?.rent ? (
            // Rent only
            <div className="flex items-center justify-between">
              <p className={`font-bold text-black ${compact ? 'text-lg' : 'text-xl'}`}>
                {(property.availableFor.rentPrice || property.price).toLocaleString()} ر.ق
              </p>
              <span className={compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>/ شهر</span>
            </div>
          ) : property.availableFor?.sale ? (
            // Sale only
            <div className="flex items-center justify-between">
              <p className={`font-bold text-black ${compact ? 'text-lg' : 'text-xl'}`}>
                {(property.availableFor.salePrice || property.price).toLocaleString()} ر.ق
              </p>
            </div>
          ) : (
            // Fallback to old format
            <div className="flex items-center justify-between">
              <p className={`font-bold text-black ${compact ? 'text-lg' : 'text-xl'}`}>
                {property.price.toLocaleString()} ر.ق
              </p>
              {property.category === 'rent' && (
                <span className={compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>/ شهر</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
