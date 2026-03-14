// app/home/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { API_BASE_URL } from '@/lib/config';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import HomeHeader from '@/app/home/components/HomeHeader';
import HomeSearch from '@/app/home/components/HomeSearch';
import HomeHero from '@/app/home/components/HomeHero';
import HomeHelp from '@/app/home/components/HomeHelp';
import HomeMaintenance from '@/app/home/components/HomeMaintenance';
import HomeFeaturedProperties from '@/app/home/components/HomeFeaturedProperties';
import HomeAppliances from '@/app/home/components/HomeAppliance';
import ResidentOffers from '@/app/home/components/ResidentOffers';
import PageWrapper from '@/components/PageWrapper';
import { CircleAlert, MapPin } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useUserLocation } from '@/hooks/useUserLocation';
import RoleGuard from '@/components/auth/RoleGuard';
import Role from '@/components/auth/RoleComponent';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { settings } = useAppSettings();
  const { lat, lng, city } = useUserLocation();

  const { data, isLoading } = useQuery({
    queryKey: ['properties', { limit: 10 }],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/properties?limit=10`);
      return response.json();
    },
  });

  const { data: appliancesData, isLoading: isLoadingAppliances } = useQuery({
    queryKey: ['appliances', { limit: 5 }],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/appliances`);
      return response.json();
    },
  });

  console.log(lat, lng, city);

  return (
    <RoleGuard allowedRoles={['resident', 'user', 'guest']} >
      <PageWrapper>
        <div className="min-h-screen bg-white pb-32">
          {/* Header */}
          <HomeHeader
            user={user}
            unreadCount={unreadCount}
            userLocation={city ?? 'تحديد الموقع'}
            isLoadingLocation={!city}
          />

          {/* Search Bar */}
          <HomeSearch />

          {/* Hero Banner */}
          <HomeHero />
          <Role roles={['resident']} >
            {/* Contract Warning Alert - Only show if user has active contracts */}
            {user && (
              <div className="px-4 mb-6">
                <div className="bg-white border border-[#E8E8E8] rounded-2xl p-3 flex items-center gap-2 shadow-sm">
                  {/* Warning Icon */}
                  <CircleAlert color="#C83636" />

                  {/* Warning Text */}
                  <p className="text-xs text-gray-700 flex-1">
                    متبقي شهر على انتهاء عقد ايجارك{' '}
                    <span
                      className="text-[#C83636] font-bold underline cursor-pointer"
                      onClick={() => router.push('/contract/renew')}
                    >
                      جدّد العقد الآن
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Role>
          {/* Help Section */}
          <HomeHelp />

          {/* Resident Offers - partner discounts for residents only */}
          <Role roles={['resident']}>
            <ResidentOffers />
          </Role>

          {/* Nearby Facilities - redirect to /nearby */}
          <Role roles={['resident']} >
            <button
              type="button"
              onClick={() => router.push('/nearby')}
              className="mx-4 mb-6 w-[calc(100%-2rem)] flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-right shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
              dir="rtl"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <MapPin className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">المرافق القريبة</p>
                <p className="text-xs text-gray-500 mt-0.5">مستشفيات، مدارس، مقاهي وأكثر</p>
              </div>
            </button>
          </Role>
          <Role roles={['resident']} >
            {/* Maintenance Services */}
            <HomeMaintenance />
          </Role>
          {/* Featured Properties */}
          <Role roles={['user', 'guest']} >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <h3 className="font-bold text-lg">وحدات مميزة</h3>
                <button
                  onClick={() => router.push('/properties')}
                  className="text-sm text-gray-500"
                >
                  المزيد
                </button>
              </div>
              <HomeFeaturedProperties data={data} isLoading={isLoading} />
            </div>
          </Role>
          {/* Appliances for Rent */}
          <HomeAppliances
            appliancesData={appliancesData}
            isLoadingAppliances={isLoadingAppliances}
          />
        </div>
      </PageWrapper>
    </RoleGuard>
  );
}