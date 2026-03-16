'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  getApplianceById,
  incrementApplianceView,
} from '@/services/appliancesService';
import { getUploadImageUrl } from '@/lib/config';
import { ApplianceDetailsSkeleton } from '@/components/ui/ApplianceDetailsSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';
import RoleGuard from '@/components/auth/RoleGuard';

export default function ApplianceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applianceId = params.id as string;

  const { data: appliance, isLoading } = useQuery({
    queryKey: ['appliance', applianceId],
    queryFn: () => getApplianceById(applianceId),
  });

  // Increment view count when page loads
  useEffect(() => {
    if (applianceId) {
      incrementApplianceView(applianceId).catch(console.error);
    }
  }, [applianceId]);

  if (isLoading) {
    return <ApplianceDetailsSkeleton />;
  }

  if (!appliance) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">الجهاز غير موجود</h2>
          <p className="text-gray-500 mb-4">لم نتمكن من العثور على الجهاز المطلوب</p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
     
    <FadeIn duration={0.3}>
      <div className="min-h-screen bg-[#FDFDFD]" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white pb-[1px] mb-5 rounded-br-[30px] rounded-bl-[30px]"
          style={{ boxShadow: "0px 2px 4px #BEBEBE40" }}>
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-5"
              aria-label="رجوع"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold flex-1 text-center -ml-8">تفاصيل الجهاز</h1>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-[277px] mb-4 mx-5">
          <Image
            src={getUploadImageUrl(appliance.images?.[0]) || '/images/placeholder-appliance.jpg'}
            alt={appliance.nameAr}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        {/* Content Container */}
        <div className="relative mx-5 pb-32">
          {/* Content Card */}
          <div className="flex flex-col bg-white rounded-2xl border border-solid border-[#E6E6E6]"
            style={{ boxShadow: "0px 1px 5px #0000000D" }}>

            {/* Device Name Section */}
            <div className="flex flex-col items-center mt-3 mb-2">
              <span className="text-[#1A1A1A] text-xl font-bold">{appliance.nameAr}</span>
              {appliance.model && (
                <span className="text-[#666666] text-base">{appliance.model}</span>
              )}
            </div>

            {/* Type */}
            <div className="flex flex-col items-start mb-1 mx-5 gap-1">
              <span className="text-[#1A1A1A] text-base mr-1">النوع:</span>
              <span className="text-[#666666] text-base mr-[1px]">{appliance.brand}</span>
            </div>
            <div className="bg-[#E6E6E6] h-[1px] mb-[3px] mx-5"></div>

            {/* Color */}
            {appliance.color && (
              <>
                <div className="flex flex-col items-start pr-[3px] mb-1 mx-5 gap-1">
                  <span className="text-[#1A1A1A] text-base text-right">اللون:</span>
                  <span className="text-[#666666] text-base text-right">{appliance.color}</span>
                </div>
                <div className="bg-[#E6E6E6] h-[1px] mb-[3px] mx-5"></div>
              </>
            )}

            {/* Device Details */}
            <div className="flex flex-col items-start mb-1 mx-5 gap-1">
              <span className="text-[#1A1A1A] text-base text-right">تفاصيل الجهاز :</span>
            </div>
            <span className="text-[#666666] text-base text-right mb-20 mx-[22px]">
              {appliance.descriptionAr}
            </span>
          </div>

          {/* Fixed Bottom Button Container */}
          <div className="fixed bottom-0 left-0 right-0 bg-white py-[15px] px-5 rounded-tl-[30px] rounded-tr-[30px]"
            style={{ boxShadow: "0px 1px 4px #70707040" }}>
            <button
              onClick={() => router.push(`/appliances/${applianceId}/book`)}
              className="w-full bg-[#1A1A1A] text-[#F3F1EB] py-3 rounded-lg font-bold text-base border border-solid border-[#1A1A1A] disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ boxShadow: "0px 1px 2px #1018280D" }}
              disabled={!appliance.isAvailable}
            >
              {appliance.isAvailable ? 'حجز الآن' : 'غير متاح'}
            </button>
            <div className="bg-[#344054D9] w-[139px] h-[5px] rounded-sm mx-auto mt-[35px]"></div>
          </div>
        </div>
      </div>
    </FadeIn>

  );
}
