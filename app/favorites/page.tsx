'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { useFavorites } from '@/hooks/useProperties';

interface Property {
  _id: string;
  title: string;
  price: number;
  category: string;
  propertyType: string;
  images: Array<{ url: string }>;
  location: {
    city: string;
    area: string;
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  };
  isFavorited?: boolean;
}

export default function FavoritesPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const { data: favorites, isLoading, refetch } = useFavorites();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleFavoriteToggle = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">المفضلة</h1>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              رجوع
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {favorites?.length || 0} وحدة مفضلة
          </p>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!favorites || favorites.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-20 h-20 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">
              لا توجد عقارات مفضلة
            </p>
            <p className="text-gray-400 text-sm mb-6">
              ابدأ بإضافة عقارات إلى المفضلة لتظهر هنا
            </p>
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              تصفح العقارات
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((property: Property) => (
              <PropertyCard
                key={property._id}
                property={{ ...property, isFavorited: true }}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation         centerButton={{
          onClick: () => router.push('/add-property'), 
          label: 'إضافة',
        }}/>
    </div>
  );
}
