'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowIcon, BathIcon, BedIcon, ChefHatIcon, LocationIcon, RulerIcon, StarIcon } from '@/components/icons';
import { contractService, type Contract } from '@/services/contractService';

interface RenewalOption {
  id: '1_year' | '2_years';
  label: string;
  years: number;
  displayPrice: string;
}

export default function RenewalPage() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<'1_year' | '2_years'>('1_year');
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadContract = async () => {
      try {
        setLoading(true);
        setError(null);
        const contracts = await contractService.getMyContracts();
        if (cancelled) return;
        // Prefer active rental contract; optionally the one expiring soonest
        const active = (contracts || []).filter(
          (c) => c.status === 'active' && c.contractType === 'rent' && c.endDate
        );
        const sorted = [...active].sort(
          (a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime()
        );
        setContract(sorted[0] ?? contracts?.[0] ?? null);
      } catch (e) {
        if (!cancelled) setError('تعذر تحميل بيانات العقد');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadContract();
    return () => { cancelled = true; };
  }, []);

  const property = contract?.propertyId;
  const isPopulated = property && typeof property === 'object' && 'title' in property;
  // API returns populated propertyId { _id, title, location, ... }; need _id for URL
  const rawId =
    property == null
      ? ''
      : typeof property === 'object' && property !== null && '_id' in property
        ? String((property as { _id: string })._id)
        : String(property);
  // Only use if it looks like a MongoDB ObjectId (24 hex); avoid values like "renew"
  const isValidMongoId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);
  const propertyIdForUrl = rawId && isValidMongoId(rawId) ? rawId : '';
  const title = isPopulated ? (property as { title?: string; titleAr?: string }).titleAr || (property as { title?: string }).title : '';
  const location = isPopulated && (property as { location?: { city?: string; area?: string } }).location
    ? `${(property as { location: { city?: string; area?: string } }).location.city || ''}، ${(property as { location: { area?: string } }).location.area || ''}`.replace(/^،\s*|،\s*$/g, '').trim() || '—'
    : '—';
  const amount = contract?.amount ?? 0;

  const renewalOptions: RenewalOption[] = [
    { id: '1_year', label: 'سنة', years: 1, displayPrice: `(${(amount * 12).toLocaleString('ar-QA')} ريال)` },
    { id: '2_years', label: 'سنتين', years: 2, displayPrice: `(${(amount * 24).toLocaleString('ar-QA')} ريال)` },
  ];

  const selectedOption = renewalOptions.find((opt) => opt.id === selectedDuration);
  const totalPrice = selectedOption ? amount * 12 * selectedOption.years : amount * 12;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-gray-600">جاري تحميل بيانات العقد...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-white flex flex-col" dir="rtl">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <button onClick={() => router.back()} className="p-2 -mr-2 hover:bg-gray-50 rounded-full" aria-label="رجوع">
              <ArrowIcon />
            </button>
            <h1 className="text-base sm:text-lg font-medium text-gray-900">تجديد العقد</h1>
            <div className="w-8 sm:w-10" />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-gray-600 mb-4">{error || 'لا يوجد عقد نشط للتجديد'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium"
          >
            رجوع
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          <button
            onClick={() => router.back()}
            className="p-2 -mr-2 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="رجوع"
          >
            <ArrowIcon />
          </button>
          <h1 className="text-base sm:text-lg md:text-xl font-medium text-gray-900">
            بيانات البطاقة
          </h1>
          <div className="w-8 sm:w-10" />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 pb-32 sm:pb-36 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {title || 'وحدة سكنية'}
            </span>
            {isPopulated && (property as { images?: { url: string; isCover?: boolean }[] }).images?.length > 0 && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={((property as { images: { url: string }[] }).images.find((i: { isCover?: boolean }) => i.isCover) || (property as { images: { url: string }[] }).images[0])?.url ?? ''}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mb-3 sm:mb-4">
            <LocationIcon />
            <span className="text-sm sm:text-base text-gray-600">{location}</span>
          </div>

          <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {amount.toLocaleString('ar-QA')} ر.ق / شهر
          </div>
        </div>

        <h2 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">
          مدّة التجديد
        </h2>

        <div className="space-y-2 sm:space-y-3 mb-4">
          {renewalOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedDuration(option.id)}
              className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
                selectedDuration === option.id
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedDuration === option.id ? 'border-gray-900' : 'border-gray-400'
                  }`}
                >
                  {selectedDuration === option.id && (
                    <div className="w-3 h-3 rounded-full bg-gray-900" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  {option.label}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">{option.displayPrice}</span>
            </button>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl sm:rounded-t-4xl shadow-lg border-t border-gray-200">
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 max-w-3xl mx-auto w-full">
          <button
            onClick={() => {
              if (propertyIdForUrl) {
                router.push(`/property/${propertyIdForUrl}/booking/sign-contract?type=rent`);
              }
            }}
            disabled={!propertyIdForUrl}
            className="w-full bg-[#000] text-white py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            العقد
          </button>
        </div>
        <div className="flex justify-center pb-2 sm:pb-3">
          <div className="w-24 sm:w-32 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
