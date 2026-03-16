'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/auth/RoleGuard';
import HeaderCard from '@/components/ui/HeaderCard';
import { useAuthStore } from '@/store/authStore';
import { useDeviceDraftStore } from '@/store/deviceDraftStore';
import { createAppliance, createApplianceListing, calculateApplianceListingFee } from '@/services/appliancesService';
import { API_BASE_URL } from '@/lib/config';

const AD_DURATIONS = [
  { value: '7_days', label: '٧ أيام', key: '7_days' },
  { value: '15_days', label: '١٥ يوماً', key: '15_days' },
  { value: '30_days', label: '٣٠ يوماً', key: '30_days' },
  { value: '90_days', label: '٩٠ يوماً', key: '90_days' },
];

export default function AddDeviceStep3Page() {
  const router = useRouter();
  const { user, token: authToken } = useAuthStore();
  const { images: draftImages, clearImages: clearDraftImages } = useDeviceDraftStore();
  const [adDuration, setAdDuration] = useState<string>('30_days');
  const [fee, setFee] = useState<{ evaluationFee: number; displayFee: number; totalCost: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const step1 = sessionStorage.getItem('addDeviceStep1');
    const step2 = sessionStorage.getItem('addDeviceStep2');
    if (!step1 || !step2) {
      toast.error('الرجاء إكمال الخطوات السابقة');
      router.push('/add-device/step-1');
      return;
    }
    calculateApplianceListingFee(adDuration).then(setFee).catch(() => setFee({ evaluationFee: 20, displayFee: 100, totalCost: 120 }));
  }, [adDuration, router]);

  useEffect(() => {
    if (!fee) calculateApplianceListingFee(adDuration).then(setFee).catch(() => setFee({ evaluationFee: 20, displayFee: 100, totalCost: 120 }));
  }, [adDuration]);

  const handleProceedToPayment = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : authToken;
    if (!token) {
      toast.error('الرجاء تسجيل الدخول');
      router.push('/auth/login');
      return;
    }
    const step1Str = sessionStorage.getItem('addDeviceStep1');
    const step2Str = sessionStorage.getItem('addDeviceStep2');
    if (!step1Str || !step2Str) {
      toast.error('بيانات الخطوات مفقودة');
      router.push('/add-device/step-1');
      return;
    }
    const step1 = JSON.parse(step1Str);
    const step2 = JSON.parse(step2Str);
    const evaluationFee = fee?.evaluationFee ?? 20;
    const displayFee = fee?.displayFee ?? 100;
    const totalCost = fee?.totalCost ?? 120;

    setIsSubmitting(true);
    try {
      let ownerId: string | null = (user as any)?._id ?? (user as any)?.id ?? null;
      if (ownerId != null && typeof ownerId !== 'string') ownerId = String(ownerId);
      if (!ownerId) {
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          ownerId = profile._id ?? profile.id ?? null;
          if (ownerId != null && typeof ownerId !== 'string') ownerId = String(ownerId);
        }
      }
      if (!ownerId) {
        toast.error('تعذر تحديد المستخدم');
        setIsSubmitting(false);
        return;
      }

      let imageUrls: string[] = [];
      if (draftImages && draftImages.length > 0) {
        const formData = new FormData();
        draftImages.forEach((file) => formData.append('files', file));
        const uploadRes = await fetch(`${API_BASE_URL}/upload/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const { urls } = await uploadRes.json();
          imageUrls = Array.isArray(urls) ? urls : [];
        }
      }

      const appliancePayload = {
        nameEn: step1.nameAr,
        nameAr: step1.nameAr,
        applianceType: step1.applianceType,
        brand: step1.brand,
        model: step1.model || undefined,
        color: step1.color || undefined,
        descriptionEn: step1.descriptionAr,
        descriptionAr: step1.descriptionAr,
        images: imageUrls,
        rentalPrices: step2.rentalPrices,
        monthlyPrice: step2.rentalPrices.oneMonth,
        deposit: step2.deposit,
        minRentalMonths: step2.minRentalMonths,
        maxRentalMonths: step2.maxRentalMonths,
        ownerId: String(ownerId),
      };

      const appliance = await createAppliance(appliancePayload, token);
      clearDraftImages();

      const listingPayload = {
        applianceId: appliance._id,
        adDuration,
        evaluationFee,
        displayFee,
        totalCost,
      };
      const listing = await createApplianceListing(listingPayload, token);

      sessionStorage.setItem('pendingDeviceListingId', listing._id);
      sessionStorage.removeItem('addDeviceStep1');
      sessionStorage.removeItem('addDeviceStep2');
      toast.success('جاري الانتقال لاختيار طريقة الدفع...');
      router.push(`/add-device/method?listingId=${listing._id}&amount=${totalCost}`);
    } catch (err: any) {
      toast.error(err.message || 'فشل في إنشاء الإعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['user', 'resident']}>
      <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
        <HeaderCard
          title="إضافة جهاز - الدفع"
          leftButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          }
        />
        <div className="px-5 py-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">فترة ظهور الإعلان</label>
            <div className="grid grid-cols-2 gap-3">
              {AD_DURATIONS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setAdDuration(d.value)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium ${
                    adDuration === d.value ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-base mb-3 text-right">تكلفة الإعلان</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{fee.evaluationFee} ر.ق</span>
                <span className="text-gray-900">تكلفة التقييم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{fee.displayFee} ر.ق</span>
                <span className="text-gray-900">ظهور الإعلان</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>{fee.totalCost} ر.ق</span>
                <span>الإجمالي</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
            className="w-full py-3 bg-black text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'متابعة للدفع'}
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}
