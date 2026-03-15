'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect, useMemo, useState } from 'react';
import { SearchPropertyCard } from '@/components/ui/SearchPropertyCard';
import { API_BASE_URL } from '@/lib/config';
import RoleGuard from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';
import HeaderCard from '@/components/ui/HeaderCard';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  price: number;
  category: string;
  propertyType: string;
  images: Array<{ url: string; isCover?: boolean }>;
  location: {
    city: string;
    area: string;
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    kitchen?: number;
  };
  isQDP?: boolean;
  availableFor?: {
    rent: boolean;
    sale: boolean;
  };
}

export default function PropertiesPage() {
  const { ref, inView } = useInView();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['properties-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `${API_BASE_URL}/properties?offset=${pageParam}&limit=10`
      );
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.reduce((acc, page) => acc + (page.properties?.length || 0), 0);
      if (loadedItems < lastPage.total) {
        return loadedItems;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allProperties = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.properties ?? []);
  }, [data?.pages]);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProperties;
    return allProperties.filter((p: Property) => {
      const title = (p.title ?? '').toLowerCase();
      const city = (p.location?.city ?? '').toLowerCase();
      const area = (p.location?.area ?? '').toLowerCase();
      return title.includes(term) || city.includes(term) || area.includes(term);
    });
  }, [allProperties, searchTerm]);

  return (
    // <RoleGuard allowedRoles={["user","guest"]} >
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      {/* Header */}
      <HeaderCard title={'الوحدات'}           leftButton={
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>}/>
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-gray-500 mt-1">
            {data?.pages[0]?.total || 0} وحدة متاحة
          </p>
        </div>

        {/* Search – same styling as home page, filters list in place */}
        <div className="px-4 py-4 bg-white">
          <div
            className="flex items-center justify-between w-full px-2 py-1 rounded-lg text-right border border-[#E8E8E8] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
            style={{ backgroundColor: 'var(--foundation-light-active, #FAFAFA)' }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Search className="flex-shrink-0" color="#666666" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث"
                dir="rtl"
                className="flex-1 min-w-0 bg-transparent text-gray-900 text-md placeholder:text-gray-400 outline-none border-none"
                aria-label="البحث"
              />
            </div>
            <button
              type="button"
              className="p-1 flex-shrink-0"
              aria-label="تصفية النتائج"
            >
              <SlidersHorizontal color="#666666" />
            </button>
          </div>
        </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="relative w-full h-[240px] rounded-[5px] bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProperties.map((property: Property, propertyIndex: number) => (
                <div
                  key={property._id}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${propertyIndex * 0.05}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <SearchPropertyCard property={property} />
                </div>
              ))}
            </div>

            {/* Loading indicator for infinite scroll (only when not filtering) */}
            {!searchTerm.trim() && hasNextPage && (
              <div ref={ref}>
                {isFetchingNextPage ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={`loading-${index}`} className="animate-pulse">
                        <div className="relative w-full h-[240px] rounded-[5px] bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    قم بالتمرير لتحميل المزيد
                  </div>
                )}
              </div>
            )}

            {!searchTerm.trim() && !hasNextPage && allProperties.length > 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                لا توجد المزيد من الوحدات
              </div>
            )}

            {filteredProperties.length === 0 && (
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm.trim() ? 'لا توجد نتائج للبحث' : 'لا توجد وحدات متاحة'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm.trim()
                    ? 'جرّب كلمات أخرى أو امسح البحث'
                    : 'تحقق مرة أخرى لاحقاً للوحدات الجديدة'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  //  </RoleGuard>
  );
}
