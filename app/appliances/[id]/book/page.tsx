'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getApplianceById,
  bookAppliance,
  CreateBookingDto,
  getRentalDurationLabel,
} from '@/services/appliancesService';
import { ApplianceImage } from '@/components/ui/ApplianceImage';
import { useAuthStore } from '@/store/authStore';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import SuccessPopup from '@/components/ui/SuccessPopup';
import { ApplianceBookingSkeleton } from '@/components/ui/ApplianceBookingSkeleton';
import { FadeIn } from '@/components/ui/FadeIn';
import RoleGuard from '@/components/auth/RoleGuard';

export default function BookAppliancePage() {
  const router = useRouter();
  const params = useParams();
  const applianceId = params.id as string;
  const { token } = useAuthStore();

  const [rentalDuration, setRentalDuration] = useState<'1_month' | '6_months' | '1_year'>('1_month');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: appliance, isLoading } = useQuery({
    queryKey: ['appliance', applianceId],
    queryFn: () => getApplianceById(applianceId),
  });

  const bookingMutation = useMutation({
    mutationFn: (data: CreateBookingDto) => {
      if (!token) throw new Error('يجب تسجيل الدخول أولاً');
      return bookAppliance(applianceId, data, token);
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error: any) => {
      alert(error.message || 'حدث خطأ أثناء الحجز');
    },
  });

  const timeSlots = [
    '10:00 ص',
    '12:00 م',
    '2:00 م',
    '4:00 م',
    '6:00 م',
    '8:00 م',
    '10:00 م',
  ];

  const handleSubmit = () => {
    if (!startDate) {
      alert('يرجى اختيار تاريخ البداية');
      return;
    }
    if (!selectedTimeSlot) {
      alert('يرجى اختيار موعد الاستلام');
      return;
    }

    const bookingData: CreateBookingDto = {
      rentalDuration,
      startDate: startDate.toISOString().split('T')[0],
      timeSlot: selectedTimeSlot,
      notes: notes || undefined,
    };

    bookingMutation.mutate(bookingData);
  };

  if (isLoading) {
    return <ApplianceBookingSkeleton />;
  }

  if (!appliance) {
    return null;
  }

  const selectedPrice =
    rentalDuration === '1_month'
      ? appliance.rentalPrices.oneMonth
      : rentalDuration === '6_months'
      ? appliance.rentalPrices.sixMonths
      : appliance.rentalPrices.oneYear;

  return (
    <RoleGuard allowedRoles={["user","resident"]} >
    <FadeIn duration={0.3}>
      <div className="min-h-screen bg-white pb-56" dir="rtl">
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
          <h1 className="text-xl font-bold flex-1">حجز الجهاز</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Appliance Summary */}
        <div className="mb-6 p-5 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <ApplianceImage
                imageUrl={appliance.images?.[0]}
                alt={appliance.nameAr}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{appliance.nameAr}</h3>
              <p className="text-sm text-gray-600 mb-1">{appliance.model}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">
                  <span className="text-gray-500">العلامة:</span> {appliance.brand}
                </span>
                {appliance.color && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-600">
                      <span className="text-gray-500">اللون:</span> {appliance.color}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rental Duration Selection */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3">مدة الايجار</h2>
          <div className="space-y-3">
            {[
              { value: '1_month' as const, label: 'شهر', price: appliance.rentalPrices.oneMonth },
              { value: '6_months' as const, label: '6 شهور', price: appliance.rentalPrices.sixMonths },
              { value: '1_year' as const, label: 'سنة', price: appliance.rentalPrices.oneYear },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRentalDuration(option.value)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                  rentalDuration === option.value
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      rentalDuration === option.value
                        ? 'border-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {rentalDuration === option.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="font-bold">{option.price} ريال</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Date Selection */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3">يوم بداية الايجار</h2>
          <button
            onClick={() => setShowCalendar(true)}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg text-right"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
            </svg>
            <span className={`flex-1 ${startDate ? 'text-black' : 'text-gray-400'}`}>
              {startDate
                ? new Date(startDate).toLocaleDateString('ar-QA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'حدد يوم بداية الايجار'}
            </span>
          </button>
        </div>

        {/* Appointment Time Selection */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3">حدد موعد الاستلام</h2>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                  selectedTimeSlot === slot
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Field */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3">ملاحظات</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا"
            className="w-full p-4 bg-gray-50 rounded-lg min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">المجموع</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{selectedPrice}</span>
            <span className="text-sm text-gray-600">ر.ق</span>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={bookingMutation.isPending || !startDate || !selectedTimeSlot}
          className="w-full bg-black text-white py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {bookingMutation.isPending ? 'جاري الحجز...' : 'حجز الآن'}
        </button>
      </div>

      {/* Calendar Picker Modal */}
      {showCalendar && (
        <CalendarPicker
          selectedDate={startDate}
          onDateSelect={(date) => {
            setStartDate(date);
            setShowCalendar(false);
          }}
          onClose={() => setShowCalendar(false)}
          minDate={new Date()}
          title="اختر تاريخ بداية الإيجار"
        />
      )}

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccess}
        title="تم الحجز بنجاح"
        description="تم حجز الجهاز بنجاح. سيتم التواصل معك قريباً"
        onClose={() => {
          setShowSuccess(false);
          router.push('/home');
        }}
        icon="success"
      />
      </div>
    </FadeIn>
    </RoleGuard>
  );
}
