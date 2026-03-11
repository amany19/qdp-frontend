'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SearchApplianceCard } from '@/components/ui/SearchApplianceCard';
import { ApplianceCardSkeleton } from '@/components/ui/ApplianceCardSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';
import 'swiper/css';
import { useRouter } from 'next/navigation';
interface Props {
  appliancesData: any;
  isLoadingAppliances: boolean;
}

export default function HomeAppliances({
  appliancesData,
  isLoadingAppliances,
}: Props) {
  if (isLoadingAppliances) {
    return (
      <div className="px-4 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <ApplianceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!appliancesData?.length) {
    return <div className="text-center py-8">لا توجد أجهزة</div>;
  }
    const router =useRouter();

  return (
         <div className="mb-6">
           <div className="flex items-center justify-between mb-4 px-4">
             <h3 className="font-bold text-lg">أجهزة للإيجار</h3>
             <button
               onClick={() => router.push('/appliances')}
               className="text-sm text-gray-500"
             >
               المزيد
             </button>
           </div>
 
        {isLoadingAppliances ? (
          <div className="px-4 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ApplianceCardSkeleton key={i} />
            ))}
          </div>
        ) : appliancesData && appliancesData.length > 0 ? (
          <Swiper
            modules={[FreeMode]}
            spaceBetween={16}
            slidesPerView={2.2}
            freeMode={true}
            dir="rtl"
            className="px-4"
          >
            {appliancesData.slice(0, 6).map((appliance: any, index: number) => (
              <SwiperSlide key={appliance._id}>
                <FadeIn delay={index * 0.05} duration={0.4}>
                  <SearchApplianceCard appliance={appliance} />
                </FadeIn>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-8 text-gray-500">
            لا توجد أجهزة متاحة حالياً
          </div>
        )}
 </div>
  );
}