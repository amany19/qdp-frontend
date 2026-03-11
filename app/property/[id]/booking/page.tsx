'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePropertyDetail } from '@/hooks/useProperties';

export default function BookingChoicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = params.id as string;
  const typeFromUrl = searchParams.get('type') as 'rent' | 'sale' | null;

  const { data: property, isLoading } = usePropertyDetail(propertyId);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!property || isLoading) return;

    // If type is already specified in URL, go directly to contract signing
    if (typeFromUrl) {
      router.push(`/property/${propertyId}/booking/sign-contract?type=${typeFromUrl}`);
      return;
    }

    // Check if property is dual-purpose
    const isDualPurpose = property.availableFor?.rent && property.availableFor?.sale;

    if (isDualPurpose) {
      // Show modal to let user choose
      setShowModal(true);
    } else if (property.availableFor?.rent) {
      // Rent only - go directly to contract signing
      router.push(`/property/${propertyId}/booking/sign-contract?type=rent`);
    } else if (property.availableFor?.sale) {
      // Sale only - go directly to contract signing
      router.push(`/property/${propertyId}/booking/sign-contract?type=sale`);
    } else {
      // Fallback to old category field
      const type = property.category === 'rent' ? 'rent' : 'sale';
      router.push(`/property/${propertyId}/booking/sign-contract?type=${type}`);
    }
  }, [property, isLoading, typeFromUrl, propertyId, router]);

  const handleChoice = (type: 'sale' | 'rent') => {
    // Navigate to contract signing page with the choice
    router.push(`/property/${propertyId}/booking/sign-contract?type=${type}`);
  };

  const handleClose = () => {
    setShowModal(false);
    router.back();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Only show modal if property is dual-purpose and no type specified
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      {/* Modal */}
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-center text-xl font-bold mb-2">
          اختر نوع الحجز
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          هذا العقار متاح للإيجار والبيع
        </p>

        {/* Rent Option */}
        <button
          onClick={() => handleChoice('rent')}
          className="w-full py-4 px-6 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors mb-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg">إيجار شهري</span>
            {property?.availableFor?.rentPrice && (
              <span className="text-xl font-bold">
                {property.availableFor.rentPrice.toLocaleString()} ر.ق/شهر
              </span>
            )}
          </div>
        </button>

        {/* Sale Option */}
        <button
          onClick={() => handleChoice('sale')}
          className="w-full py-4 px-6 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors mb-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg">شراء كامل</span>
            {property?.availableFor?.salePrice && (
              <span className="text-xl font-bold">
                {property.availableFor.salePrice.toLocaleString()} ر.ق
              </span>
            )}
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={handleClose}
          className="w-full py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
