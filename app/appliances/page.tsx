'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAppliances, getApplianceTypeLabel } from '@/services/appliancesService';
import { SearchApplianceCard } from '@/components/ui/SearchApplianceCard';
import { ApplianceGridSkeleton } from '@/components/ui/ApplianceCardSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';
import RoleGuard from '@/components/auth/RoleGuard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

export default function AppliancesPage() {

  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');

  const { data: appliances, isLoading } = useQuery({
    queryKey: ['appliances', selectedType],
    queryFn: () => getAppliances(selectedType ? { applianceType: selectedType } : undefined),
  });

  const applianceTypes = [
    { value: '', label: 'الكل' },
    { value: 'refrigerator', label: 'ثلاجة' },
    { value: 'tv', label: 'تلفزيون' },
    { value: 'washing_machine', label: 'غسالة' },
    { value: 'ac', label: 'مكيف' },
    { value: 'oven', label: 'فرن' },
    { value: 'microwave', label: 'ميكروويف' },
    { value: 'dishwasher', label: 'غسالة صحون' },
  ];

  return (
    <RoleGuard allowedRoles={['user','resident','guest']}>
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 -mr-2"
            aria-label="رجوع"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <h1 className="text-xl font-bold flex-1">أجهزة للإيجار</h1>
        </div>

        {/* Filter Tabs */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 px-4 pb-3 min-w-max">
            {applianceTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <ApplianceGridSkeleton count={6} />
        ) : appliances && appliances.length > 0 ? (
          <FadeIn>
            <p className="text-sm text-gray-500 mb-4">
              تم العثور على {appliances.length} {appliances.length === 1 ? 'جهاز' : 'جهاز'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {appliances.map((appliance, index) => (
                <FadeIn key={appliance._id} delay={index * 0.05} duration={0.4}>
                  <SearchApplianceCard appliance={appliance} />
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">لا توجد أجهزة</h3>
            <p className="text-gray-500 text-sm">
              {selectedType
                ? `لا توجد أجهزة من نوع ${getApplianceTypeLabel(selectedType)} حالياً`
                : 'لا توجد أجهزة متاحة للإيجار حالياً'}
            </p>
          </div>
        )}
      </div>

      {/* Add custom styles for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
    </div>
<BottomNavigation/>
    </RoleGuard>
  );
}
