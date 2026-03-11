'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyDetail } from '@/hooks/useProperties';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading } = usePropertyDetail(propertyId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [checkingBooking, setCheckingBooking] = useState(true);

  // Check if user already has an active booking for this property
  useEffect(() => {
    const checkExistingBooking = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        if (!token || !propertyId) {
          setCheckingBooking(false);
          return;
        }

        const url = `${API_BASE_URL}/user/bookings/check/${propertyId}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasBooking && data.booking) {
            setHasExistingBooking(true);
            setExistingBooking(data.booking);
          }
        }
      } catch {
        // Failed to fetch: backend unreachable, CORS, or network error.
        // Treat as no existing booking so the page still works.
      } finally {
        setCheckingBooking(false);
      }
    };

    checkExistingBooking();
  }, [propertyId]);

  if (isLoading || checkingBooking) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A]"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">العقار غير موجود</h2>
          <p className="text-[#666666] mb-4">لم نتمكن من العثور على العقار المطلوب</p>
          <button
            onClick={() => router.back()}
            className="bg-[#1A1A1A] text-[#F3F1EB] px-6 py-3 rounded-lg font-bold"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const coverImage = property.images?.find((img: any) => img.isCover) || property.images?.[0];
  const nearbyServices = property.nearbyServices || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD]" dir="rtl">
      {/* Full-height Property Image */}
      <div className="relative h-[300px]">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">لا توجد صورة</span>
          </div>
        )}

        {/* Header Overlay with Glass Effect */}
        <div className="absolute top-0 left-0 right-0 bg-[#ffffff64] backdrop-transparent-sm rounded-b-[30px]"
          style={{ boxShadow: "0px 2px 4px #BEBEBE40" }}>
          <div className="flex items-center py-4">
            <button
              onClick={() => router.back()}
              className="mr-5"
              aria-label="رجوع"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <h1 className="text-lg font-normal flex-1 text-center -ml-1">تفاصيل الوحدة</h1>
          </div>
        </div>

      </div>

      {/* Content Section with Rounded Top */}
      <div className="relative -mt-8 bg-white rounded-t-[30px] pb-48">
        <div className="px-5 pt-6">
          {/* Title and Badges Row */}
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-[#1A1A1A] flex-1">{property.title}</h2>
            <div className="flex gap-2 mr-3">
              <span className="px-3 py-1 bg-[#1A1A1A] text-white text-xs font-medium rounded-lg">
                {property.isQDP ? 'QDP' : 'خارجي'}
              </span>
              {property.availableFor?.rent && property.availableFor?.sale ? (
                <span className="px-3 py-1 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  للإيجار والبيع
                </span>
              ) : property.availableFor?.rent ? (
                <span className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-500 text-white">
                  للإيجار
                </span>
              ) : property.availableFor?.sale ? (
                <span className="px-3 py-1 text-xs font-medium rounded-lg bg-green-500 text-white">
                  للبيع
                </span>
              ) : (
                <span className={`px-3 py-1 text-xs font-medium rounded-lg text-white ${
                  property.category === 'rent' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {property.category === 'rent' ? 'للإيجار' : 'للبيع'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#666666] mb-5">
            <Image
              src="/icons/location.svg"
              alt="location"
              width={20}
              height={20}
            />
            <span className="text-base">{property.location.city}، {property.location.area}</span>
          </div>

          {/* Specifications Card */}
          <div className="mb-5">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#F3F1EB] rounded-full flex items-center justify-center mb-2">
                  <Image
                    src="/icons/area.svg"
                    alt="area"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-xs text-[#000]">{property.specifications.areaSqm} م²</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#F3F1EB] rounded-full flex items-center justify-center mb-2">
                  <Image
                    src="/icons/ion_bed-outline.svg"
                    alt="bedrooms"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-xs text-[#000]">{property.specifications.bedrooms || 0} غرف</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#F3F1EB] rounded-full flex items-center justify-center mb-2">
                  <Image
                    src="/icons/bathroom.svg"
                    alt="bathrooms"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-xs text-[#000]">{property.specifications.bathrooms} حمام</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#F3F1EB] rounded-full flex items-center justify-center mb-2">
                  <Image
                    src="/icons/lucide_cooking-pot.svg"
                    alt="kitchen"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="text-xs text-[#000]">1 مطبخ</span>
              </div>
            </div>
            <div className="bg-[#E6E6E6] h-[1px] mt-5"></div>
          </div>

          {/* Nearby Services with Map */}
          {nearbyServices.length > 0 && (
            <div className="mb-5">
              <h3 className="font-medium text-base text-[#000] mb-2.5">الخدمات القريبة</h3>
              <div className="flex items-start gap-2.5">
                {/* Services List */}
                <div className="flex flex-col items-start gap-0.5 flex-1">
                  {nearbyServices.map((service: any, index: number) => (
                    <div key={index} className="inline-flex items-center justify-start gap-1">
                      <Image
                        src="/icons/ion_checkmark-circle.svg"
                        alt="checkmark"
                        width={14}
                        height={14}
                      />
                      <span className="text-xs text-[#4D4D4D]">{service.name}</span>
                    </div>
                  ))}
                </div>

                {/* Map */}
                <div className="w-[182px] h-[138px] rounded-[5px] overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/map.png"
                    alt="map"
                    width={182}
                    height={138}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="bg-[#E6E6E6] h-[1px] mt-5"></div>
          </div>
        <div className="px-5 pt-2">
          {/* Pricing */}
          <div className="mb-5">
            <h3 className="font-bold text-base text-[#1A1A1A] mb-2.5">السعر</h3>
            <div className=" p-4">
              {property.availableFor?.rent && property.availableFor?.sale ? (
                // Both rent and sale available
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-[#E6E6E6]">
                    <span className="text-[#666666] text-sm">سعر الإيجار</span>
                    <div className="text-left">
                      <span className="text-xl font-bold text-[#3B82F6]">
                        {(property.availableFor.rentPrice || property.rentalPrice)?.toLocaleString()}
                      </span>
                      <span className="text-[#666666] text-sm mr-1">ر.ق / شهر</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#666666] text-sm">سعر البيع</span>
                    <div className="text-left">
                      <span className="text-xl font-bold text-[#22C55E]">
                        {(property.availableFor.salePrice || property.salePrice)?.toLocaleString()}
                      </span>
                      <span className="text-[#666666] text-sm mr-1">ر.ق</span>
                    </div>
                  </div>
                  {property.availableFor.insuranceDeposit && (
                    <div className="flex items-center justify-between py-2 border-t border-[#E6E6E6]">
                      <span className="text-[#666666] text-sm">التأمين</span>
                      <span className="text-base font-semibold text-[#1A1A1A]">
                        {property.availableFor.insuranceDeposit.toLocaleString()} ر.ق
                      </span>
                    </div>
                  )}
                </div>
              ) : property.availableFor?.rent ? (
                // Rent only
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666] text-sm">الإيجار الشهري</span>
                    <div className="text-left">
                      <span className="text-xl font-bold text-[#1A1A1A]">
                        {(property.availableFor.rentPrice || property.rentalPrice)?.toLocaleString()}
                      </span>
                      <span className="text-[#666666] text-sm mr-1">ر.ق / شهر</span>
                    </div>
                  </div>
                  {property.availableFor.insuranceDeposit && (
                    <div className="flex items-center justify-between py-2 border-t border-[#E6E6E6]">
                      <span className="text-[#666666] text-sm">التأمين</span>
                      <span className="text-base font-semibold text-[#1A1A1A]">
                        {property.availableFor.insuranceDeposit.toLocaleString()} ر.ق
                      </span>
                    </div>
                  )}
                  {property.availableFor.contractDuration && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#666666] text-sm">مدة العقد</span>
                      <span className="text-base font-semibold text-[#1A1A1A]">
                        {property.availableFor.contractDuration} شهر
                      </span>
                    </div>
                  )}
                </div>
              ) : property.availableFor?.sale ? (
                // Sale only
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] text-sm">السعر الكامل</span>
                  <div className="text-left">
                    <span className="text-xl font-bold text-[#1A1A1A]">
                      {(property.availableFor.salePrice || property.salePrice)?.toLocaleString()}
                    </span>
                    <span className="text-[#666666] text-sm mr-1">ر.ق</span>
                  </div>
                </div>
              ) : (
                // Fallback to old format
                <div className="space-y-3">
                  {property.rentalPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] text-sm">سعر الايجار</span>
                      <div className="text-left">
                        <span className="text-xl font-bold text-[#1A1A1A]">
                          {property.rentalPrice.toLocaleString()}
                        </span>
                        <span className="text-[#666666] text-sm mr-1">ر.ق / شهر</span>
                      </div>
                    </div>
                  )}
                  {property.salePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#666666] text-sm">سعر البيع</span>
                      <div className="text-left">
                        <span className="text-xl font-bold text-[#1A1A1A]">
                          {property.salePrice.toLocaleString()}
                        </span>
                        <span className="text-[#666666] text-sm mr-1">ر.ق</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
</div>
          {/* Property Transfer Section - Only for rent properties */}
          {property.availableFor?.rent && (
            <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-[#BFDBFE]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">مستأجر حالي؟</h4>
                  <p className="text-xs text-[#666666] mb-3">
                    إذا كنت مستأجراً لعقار آخر وترغب في الانتقال إلى هذا العقار، يمكنك تقديم طلب نقل
                  </p>
                  <button
                    onClick={() => router.push(`/property/${propertyId}/transfer-request`)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] text-white font-medium text-sm"
                  >
                    تقديم طلب نقل عقار
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-[15px] px-5 rounded-tl-[30px] rounded-tr-[30px] z-50"
        style={{ boxShadow: "0px -2px 10px #00000010" }}>
        {hasExistingBooking ? (
          /* Show message when user already has a booking */
          <div dir="rtl">
            <div className="bg-[#FFFBEB] rounded-2xl p-4 border border-[#FCD34D] mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1A1A1A] text-sm mb-1">لديك حجز نشط بالفعل</h4>
                  <p className="text-xs text-[#666666] mb-3">
                    لديك حجز نشط لهذا العقار. لا يمكنك حجز نفس العقار مرتين.
                  </p>
                  <button
                    onClick={() => router.push(`/my-bookings/${existingBooking._id}`)}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#F59E0B] text-white font-medium text-sm"
                  >
                    عرض تفاصيل الحجز
                  </button>
                </div>
              </div>
            </div>

            {/* Still allow viewing requests */}
            <button
              onClick={() => router.push(`/property/${propertyId}/viewing`)}
              className="w-full py-3 rounded-lg border border-[#E6E6E6] text-[#666666] font-medium text-base"
            >
              طلب معاينة
            </button>
          </div>
        ) : (
          /* Show normal booking buttons when no existing booking */
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/property/${propertyId}/viewing`)}
              className="flex-1 py-3 rounded-lg border border-[#E6E6E6] text-[#666666] font-medium text-base"
            >
              طلب معاينة
            </button>
            <button
              onClick={() => {
                // If property available for both, show modal to choose
                if (property?.availableFor?.rent && property?.availableFor?.sale) {
                  setShowBookingModal(true);
                } else if (property?.availableFor?.rent) {
                  router.push(`/property/${propertyId}/booking?type=rent`);
                } else if (property?.availableFor?.sale) {
                  router.push(`/property/${propertyId}/booking?type=sale`);
                } else {
                  // Fallback to old category
                  router.push(`/property/${propertyId}/booking`);
                }
              }}
              className="flex-1 py-3 rounded-lg bg-[#1A1A1A] text-[#F3F1EB] font-bold text-base"
              style={{ boxShadow: "0px 1px 2px #1018280D" }}
            >
              حجز الوحدة
            </button>
          </div>
        )}
        <div className="bg-[#344054D9] w-[139px] h-[5px] rounded-sm mx-auto mt-[20px]"></div>
      </div>

      {/* Booking Type Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-[60]"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-t-[30px] p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="w-12 h-1 bg-[#E6E6E6] rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">اختر نوع الحجز</h3>
            <p className="text-[#666666] text-sm text-center mb-6">هذا العقار متاح للإيجار والبيع</p>

            <div className="space-y-3">
              {/* Rent Option */}
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  router.push(`/property/${propertyId}/booking?type=rent`);
                }}
                className="w-full py-4 px-5 rounded-2xl bg-[#3B82F6] text-white font-medium"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">إيجار شهري</span>
                  <span className="text-lg font-bold">
                    {property?.availableFor?.rentPrice?.toLocaleString()} ر.ق/شهر
                  </span>
                </div>
              </button>

              {/* Sale Option */}
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  router.push(`/property/${propertyId}/booking?type=sale`);
                }}
                className="w-full py-4 px-5 rounded-2xl bg-[#22C55E] text-white font-medium"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">شراء كامل</span>
                  <span className="text-lg font-bold">
                    {property?.availableFor?.salePrice?.toLocaleString()} ر.ق
                  </span>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full py-3 rounded-lg border border-[#E6E6E6] text-[#666666] font-medium text-base"
              >
                إلغاء
              </button>
            </div>
            <div className="bg-[#344054D9] w-[139px] h-[5px] rounded-sm mx-auto mt-6"></div>
          </div>
        </div>
      )}
    </div>
  );
}
