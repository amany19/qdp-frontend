'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchPropertyCard } from '@/components/ui/SearchPropertyCard';
import { usePropertyStore } from '@/store/propertyStore';
import { API_BASE_URL } from '@/lib/config';

interface Property {
  _id: string;
  [key: string]: unknown;
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const { filters } = usePropertyStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['properties', filters, searchQuery],
    queryFn: async () => {
      // Build query params from filters inside queryFn (using searchTerm for backend)
      const queryParams = new URLSearchParams();
      if (filters.propertyType?.length) queryParams.append('propertyType', filters.propertyType.join(','));
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.area) queryParams.append('area', filters.area);
      if (searchQuery) queryParams.append('searchTerm', searchQuery);

      // Always add a reasonable limit
      if (!queryParams.has('limit')) queryParams.append('limit', '50');

      const url = `${API_BASE_URL}/properties?${queryParams.toString()}`;

      const response = await fetch(url);
      return response.json();
    },
  });

  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery);

  useEffect(() => {
    if (searchQuery) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      router.push(`/search/results?q=${encodeURIComponent(localSearchTerm)}`);
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white pb-6" dir="rtl">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center">البحث</h1>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="البحث"
            className="flex-1 outline-none bg-transparent text-base"
          />
          <button
            onClick={() => router.push('/search/filters')}
            className="p-1"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
          </div>
        ) : data?.properties?.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {data.properties.length} نتيجة
            </div>
            <div className="space-y-4">
              {data.properties.map((property: Property) => (
                <SearchPropertyCard key={property._id} property={property} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-500 text-sm">
              جرب البحث بكلمات مختلفة أو قم بتعديل الفلاتر
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
