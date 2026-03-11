'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/propertyStore';
import { ArrowUpDown, BuildingIcon, Globe, Heart, MapPin, Star, Map, ArrowUp, ArrowDown, X } from 'lucide-react';
import { BedIcon } from '@/components/icons';

export default function FiltersPage() {
  const router = useRouter();
  const { filters, setFilters, resetFilters } = usePropertyStore();

  const [sortBy, setSortBy] = useState<string>(filters.sortBy || 'nearest');
  const [priceOrder, setPriceOrder] = useState<'asc' | 'desc'>('asc');
  const [unitType, setUnitType] = useState<'qdp' | 'external' | null>(null);
  const [selectedComplex, setSelectedComplex] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(filters.bedrooms);

  const complexes = ['الواحة', 'الخزائن', 'النخيل', 'الزيان', 'المزيد'];
  const bedroomOptions = [1, 2, 3, 4, 5];

  const handleApply = () => {
    setFilters({
      sortBy: sortBy === 'price_asc' ? 'price_asc' : sortBy === 'price_desc' ? 'price_desc' : 'date_desc',
      bedrooms: selectedBedrooms,
      propertyType: unitType ? [unitType] : [],
    });
    router.push('/search/results');
  };

  const handleClear = () => {
    resetFilters();
    setSortBy('nearest');
    setPriceOrder('asc');
    setUnitType(null);
    setSelectedComplex([]);
    setSelectedBedrooms(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white flex items-center justify-center p-0">
      {/* Mobile Container */}
      <div className="w-full h-screen md:h-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white flex flex-col">

        {/* Header - Responsive */}
        <div className="sticky top-0 z-10 bg-white px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">فلتر</h1>
            <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm md:text-base">
              <MapPin size={14} className="sm:w-4 sm:h-4" />
              <span>الدوحة, قطر</span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Scrollable Content - Optimized spacing for mobile */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-8">
          {/* SORT BY */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="sm:w-5 sm:h-5" />
              <h2 className="text-sm sm:text-base md:text-lg font-bold">ترتيب حسب</h2>
            </div>

            {/* Sort Options - Responsive Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center justify-center gap-1 px-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  sortBy === 'popular'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Heart size={14} className="sm:w-4 sm:h-4" />
                <span className="truncate">الاكثر شيوعا</span>
              </button>

              <button
                onClick={() => setSortBy('rating')}
                className={`flex items-center justify-center gap-1 px-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  sortBy === 'rating'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Star size={14} className="sm:w-4 sm:h-4" />
                <span className="truncate">الاعلي تقييم</span>
              </button>

              <button
                onClick={() => setSortBy('nearest')}
                className={`flex items-center justify-center gap-1 px-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  sortBy === 'nearest'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Map size={14} className="sm:w-4 sm:h-4" />
                <span className="truncate">الأقرب اليك</span>
              </button>
            </div>

            {/* Price Sort - Responsive */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setPriceOrder('desc');
                  setSortBy('price_desc');
                }}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  priceOrder === 'desc'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUp size={14} className="sm:w-4 sm:h-4" />
                <span>الأعلي سعر</span>
              </button>

              <button
                onClick={() => {
                  setPriceOrder('asc');
                  setSortBy('price_asc');
                }}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  priceOrder === 'asc'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowDown size={14} className="sm:w-4 sm:h-4" />
                <span>الأقل سعر</span>
              </button>
            </div>
          </section>

          {/* UNIT TYPE */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={18} className="sm:w-5 sm:h-5" />
              <h2 className="text-sm sm:text-base md:text-lg font-bold">نوع الوحدة</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUnitType('external')}
                className={`px-4 py-3 sm:py-3.5 rounded-xl border text-sm sm:text-base font-bold transition-all ${
                  unitType === 'external'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                عقارات خارجية
              </button>

              <button
                onClick={() => setUnitType('qdp')}
                className={`px-4 py-3 sm:py-3.5 rounded-xl border text-sm sm:text-base font-bold transition-all ${
                  unitType === 'qdp'
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                عقارات QDP
              </button>
            </div>
          </section>

          {/* COMPLEX */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <BuildingIcon size={18} className="sm:w-5 sm:h-5" />
              <h2 className="text-sm sm:text-base md:text-lg font-bold">المجمع السكني</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {complexes.map((complex) => (
                <button
                  key={complex}
                  onClick={() => {
                    setSelectedComplex((prev) =>
                      prev.includes(complex)
                        ? prev.filter((c) => c !== complex)
                        : [...prev, complex]
                    );
                  }}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base font-bold transition-all ${
                    selectedComplex.includes(complex)
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {complex}
                </button>
              ))}
            </div>
          </section>

          {/* BEDROOMS */}
          <hr className="border-gray-200" />
          
          {/* BEDROOMS - Responsive */}
          <section className="space-y-1 sm:space-y-4">
            {/* Header with icon - Responsive */}
            <div className="flex items-center gap-2 w-full max-w-[350px] mx-auto sm:mx-0 md:max-w-none">
              <BedIcon className="w-5 h-5 text-black flex-shrink-0" />
              <span className="text-base font-bold text-black font-tajawal">عدد الغرف</span>
            </div>

            {/* Bedroom options - Responsive */}
            <div className="flex flex-row justify-between items-center w-full max-w-[350px] mx-auto sm:mx-0 md:max-w-none md:justify-start md:gap-4 h-[50px] gap-3">
              {[5, 4, 3, 2, 1].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedBedrooms(num)}
                  className={`
                    w-[50px] h-[50px] md:w-[60px] md:h-[60px] lg:w-[70px] lg:h-[70px] 
                    flex items-center justify-center rounded-[10px] transition-all
                    ${
                      selectedBedrooms === num
                        ? 'border-2 border-black' 
                        : 'border border-[#E6E6E6] hover:border-gray-300'
                    }
                  `}
                >
                  <span className="font-madani text-lg md:text-xl lg:text-2xl font-bold text-black">
                    {num}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Actions - Responsive */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-gray-100 rounded-t-4xl shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[390px] mx-auto sm:max-w-none md:max-w-2xl lg:max-w-4xl">
            <button
              onClick={handleApply}
              className="w-full bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-800 transition-colors"
            >
              حفظ
            </button>
            <button
              onClick={handleClear}
              className="w-full bg-gray-100 text-gray-700 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 transition-colors"
            >
              مسح الاختيارات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}