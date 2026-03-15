'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import HeaderCard from '@/components/ui/HeaderCard';
import { ArrowRight } from 'lucide-react';
import { contractService, type Contract } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/lib/config';
import { nearbyService, type NearbyPlace } from '@/services/nearbyService';
import UnitFeaturesStrip from '@/components/ui/UnitFeaturesStrip';
import CommitmentRewardCard from '@/components/ui/CommitmentRewardCard';
import ContractReminderCard from '@/app/profile/components/ContractReminderCard';
import WarningPopup from '@/components/ui/WarningPopup';

const NEARBY_BADGE_STYLES: Record<string, { label: string; badgeClass: string }> = {
  hospital: { label: 'مستشفى', badgeClass: 'bg-red-50 text-red-700 border border-red-100' },
  pharmacy: { label: 'صيدلية', badgeClass: 'bg-rose-50 text-rose-700 border border-rose-100' },
  school: { label: 'مدرسة', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100' },
  restaurant: { label: 'مطعم', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-100' },
  cafe: { label: 'كافيه', badgeClass: 'bg-orange-50 text-orange-700 border border-orange-100' },
  mall: { label: 'مول', badgeClass: 'bg-violet-50 text-violet-700 border border-violet-100' },
  park: { label: 'حديقة', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  gym: { label: 'مركز رياضي', badgeClass: 'bg-sky-50 text-sky-700 border border-sky-100' },
  amenity: { label: 'مرافق', badgeClass: 'bg-slate-50 text-slate-600 border border-slate-100' },
  shop: { label: 'متجر', badgeClass: 'bg-teal-50 text-teal-700 border border-teal-100' },
  leisure: { label: 'ترفيه', badgeClass: 'bg-lime-50 text-lime-700 border border-lime-100' },
};
function getNearbyBadgeStyle(type?: string) {
  if (!type) return { label: 'مكان', badgeClass: 'bg-gray-50 text-gray-600 border border-gray-100' };
  return NEARBY_BADGE_STYLES[type.toLowerCase()] ?? { label: type, badgeClass: 'bg-gray-50 text-gray-600 border border-gray-100' };
}

interface Booking {
  _id: string;
  contractId?: { _id: string };
  installments?: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paidAt?: string;
  }>;
  monthlyAmount?: number;
  numberOfInstallments?: number;
}

interface PropertySpecs {
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  livingRooms?: number;
}

export default function MyUnitPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.user?.userType);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmCancelPopup, setShowConfirmCancelPopup] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const [contractsData, bookingsRes] = await Promise.all([
        contractService.getMyContracts(),
        fetch(`${API_BASE_URL}/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setContracts(contractsData || []);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (e) {
      console.error('Failed to load my-unit data', e);
    } finally {
      setLoading(false);
    }
  };

  const activeContract = contracts.find(
    (c) => c.status === 'active' || c.status === 'pending_signature'
  ) || contracts[0];

  const getContractId = (b: Booking): string | undefined => {
    if (!b.contractId) return undefined;
    if (typeof b.contractId === 'object' && b.contractId !== null && '_id' in b.contractId)
      return String((b.contractId as { _id: string })._id);
    return String(b.contractId);
  };
  const contractIdStr = activeContract ? String(activeContract._id) : '';
  const matchedByContract = activeContract
    ? bookings.find((b) => getContractId(b) === contractIdStr)
    : null;
  const rentBookings = bookings.filter((b) => b.bookingType === 'rent');
  const bookingForContract =
    matchedByContract ??
    (activeContract && rentBookings.length > 0 ? rentBookings[0] : null);

  // #region agent log
  useEffect(() => {
    const bid = bookingForContract?._id != null ? String(bookingForContract._id) : '';
    const url = `/my-transfers/replace-tenant?bookingId=${bid}`;
    fetch('http://127.0.0.1:7841/ingest/1a620294-f867-41fe-8dbd-93cde5bb999b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1a3b6c' },
      body: JSON.stringify({
        sessionId: '1a3b6c',
        location: 'my-unit/page.tsx:bookingForContract',
        message: 'My-unit: replace-tenant link data',
        data: {
          bookingsLength: bookings?.length ?? 0,
          contractIdStr,
          hasMatchedByContract: !!matchedByContract,
          rentBookingsLength: rentBookings?.length ?? 0,
          bookingForContractId: bid,
          builtUrl: url,
        },
        timestamp: Date.now(),
        hypothesisId: 'H1-H5',
      }),
    }).catch(() => {});
  }, [bookings?.length, contractIdStr, matchedByContract, rentBookings?.length, bookingForContract?._id]);
  // #endregion

  const propertyIdForNearby = activeContract
    ? (typeof activeContract.propertyId === 'object' &&
       activeContract.propertyId !== null &&
       '_id' in (activeContract.propertyId as object)
      ? String((activeContract.propertyId as { _id: string })._id)
      : String(activeContract.propertyId))
    : undefined;
  useEffect(() => {
    if (!propertyIdForNearby) return;
    let cancelled = false;
    setNearbyLoading(true);
    nearbyService
      .getNearbyByProperty(propertyIdForNearby)
      .then((data) => {
        if (!cancelled) setNearbyPlaces(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setNearbyPlaces([]);
      })
      .finally(() => {
        if (!cancelled) setNearbyLoading(false);
      });
    return () => { cancelled = true; };
  }, [propertyIdForNearby]);

  const installments = bookingForContract?.installments || [];
  const paidOnTime = installments.filter((i) => i.status === 'paid').length;
  const totalInstallments = installments.length || activeContract?.numberOfChecks || 12;
  const remainingBalance =
    installments
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0;

  if (!isAuthenticated || userType === 'admin') return null;

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center" dir="rtl">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent" />
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
        <BottomNavigation />
      </>
    );
  }

  if (!activeContract) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
          <HeaderCard
            title="وحدتي"
            leftButton={
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowRight className="w-5 h-5 text-gray-900" />
              </button>
            }
          />
          <div className="px-5 py-12 text-center">
            <p className="text-gray-600 mb-4">لا توجد وحدة مرتبطة بحسابك</p>
            <button
              onClick={() => router.push('/home')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
        <BottomNavigation />
      </>
    );
  }

  const property = activeContract.propertyId as any;
  const specs: PropertySpecs = property?.specifications || {};
  const endDate = activeContract.endDate ? new Date(activeContract.endDate) : null;
  const startDate = activeContract.startDate ? new Date(activeContract.startDate) : null;
  const daysUntilExpiry = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const showExpiryWarning = daysUntilExpiry <= 30 && activeContract.contractType === 'rent';
  const leaseMonths = endDate && startDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : activeContract.numberOfChecks || 12;

  const handleCancelRequest = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      setCancelError('يرجى إدخال سبب الإلغاء (10 أحرف على الأقل)');
      return;
    }
    if (!activeContract) return;
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      await contractService.requestCancellation(activeContract._id, {
        cancellationReason: cancelReason.trim(),
      });
      setShowCancelModal(false);
      setCancelReason('');
      loadData();
    } catch (e: any) {
      setCancelError(e?.response?.data?.message || e?.message || 'فشل في إرسال طلب الإلغاء');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const unitTitle =
    property?.titleAr || property?.title || `وحدة رقم ${(property?._id || '').slice(-4)}`;

  const previewNearby = nearbyPlaces.slice(0, 4);

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <HeaderCard
          title="وحدتي"
          leftButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>
          }
        />

        <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
          {/* Card 1: Contract reminder (expiry + payment due) - same as profile my-unit tab */}
          <ContractReminderCard
            daysRemaining={daysUntilExpiry}
            contractId={activeContract._id}
            paymentDueDays={15}
            userType="resident"
            remainingBalance={remainingBalance > 0 ? remainingBalance : undefined}
            payNowHref={bookingForContract?._id ? `/my-bookings/${bookingForContract._id}` : undefined}
            payNowDisabled={!bookingForContract?._id}
            className="w-full"
          />

          {/* Card 2: Commitment reward - reusable component */}
          {activeContract.contractType === 'rent' && (
            <CommitmentRewardCard
              paymentsOnTime={paidOnTime}
              totalPayments={totalInstallments}
            />
          )}

          {/* Card 3: Unit details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-900">تفاصيل الوحدة</h3>
            <UnitFeaturesStrip
              unitTitle={unitTitle}
              kitchenLabel="1 مطبخ"
              bathroomsLabel={specs.bathrooms != null ? `${specs.bathrooms} حمام` : 'حمام'}
              bedroomsLabel={specs.bedrooms != null ? `${specs.bedrooms} غرف` : 'غرف'}
              areaLabel={specs.areaSqm != null ? `${specs.areaSqm} متر` : 'متر'}
            />

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">مدة الايجار</span>
                <span className="font-semibold text-gray-900">{leaseMonths} شهور</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">بداية من</span>
                <span className="font-semibold text-gray-900">
                  {startDate?.toLocaleDateString('ar-QA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }) || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">ينتهي في</span>
                <span className="font-semibold text-gray-900">
                  {endDate?.toLocaleDateString('ar-QA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  }) || '—'}
                </span>
              </div>
            </div>

            {bookingForContract && (
              <button
                onClick={() => router.push(`/my-bookings/${bookingForContract._id}`)}
                className="w-full mt-2 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                عرض تفاصيل الدفعات
              </button>
            )}

            {activeContract.status === 'active' && (
              <button
                onClick={() => setShowConfirmCancelPopup(true)}
                className="w-full mt-1 py-2.5 text-sm font-medium text-[#C83636] border border-[#C83636] rounded-xl hover:bg-red-50"
              >
                طلب إلغاء العقد
              </button>
            )}
          </div>
        </div>

        {/* Transfer / replacement requests — shown by case: tenant (rent) vs owner (sale) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3" dir="rtl">
          <h3 className="text-base font-bold text-gray-900">طلبات النقل والاستبدال</h3>
          {activeContract.contractType === 'rent' && (
            <>
              <button
                type="button"
                onClick={() => router.push(`/my-transfers/replace-tenant?bookingId=${bookingForContract?._id || ''}`)}
                className="w-full py-2.5 text-sm font-medium text-gray-800 bg-gray-100 rounded-xl hover:bg-gray-200 text-right"
              >
                طلب استبدال مستأجر
              </button>
              {/* IMPLEMENT IF REQUESTED */}
              {/* <button
                type="button"
                onClick={() => router.push('/my-transfers/property-transfer')}
                className="w-full py-2.5 text-sm font-medium text-gray-800 bg-gray-100 rounded-xl hover:bg-gray-200 text-right"
              >
                نقل إلى وحدة أخرى
              </button> */}
            </>
          )}
          {activeContract.contractType === 'sale' && (
            <button
              type="button"
              onClick={() => router.push('/my-transfers/ownership')}
              className="w-full py-2.5 text-sm font-medium text-gray-800 bg-gray-100 rounded-xl hover:bg-gray-200 text-right"
            >
              طلب نقل ملكية (بعد البيع)
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push('/my-transfers')}
            className="w-full mt-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            عرض طلباتي
          </button>
        </div>

        {/* Nearby facilities (coordinates from property in DB) */}
        {propertyIdForNearby && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => router.push(`/my-unit/nearby?propertyId=${propertyIdForNearby}`)}
              className="w-full flex items-center gap-3 p-4 text-right transition-colors hover:bg-gray-50 active:scale-[0.99]"
              dir="rtl"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <MapPin className="h-6 w-6 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">المرافق القريبة من وحدتي</p>
                <p className="text-xs text-gray-500 mt-0.5">مستشفيات، مدارس، مقاهي وأكثر (حسب موقع الوحدة)</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 shrink-0" />
            </button>
            {nearbyLoading ? (
              <div className="px-4 pb-4 flex justify-center">
                <span className="text-sm text-gray-500">جاري تحميل المرافق...</span>
              </div>
            ) : previewNearby.length > 0 ? (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                {previewNearby.map((place, i) => {
                  const style = getNearbyBadgeStyle(place.type);
                  return (
                    <div key={`${place.lat}-${place.lng}-${i}`} className="flex items-center justify-between text-sm gap-2">
                      <span className="text-gray-900 font-medium truncate flex-1 min-w-0">{place.name}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl border shrink-0 ${style.badgeClass}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => router.push(`/my-unit/nearby?propertyId=${propertyIdForNearby}`)}
                  className="w-full mt-2 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  عرض الكل
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Confirm cancel contract – warning popup (design: yellow !, dashed border, two buttons) */}
        <WarningPopup
          isOpen={showConfirmCancelPopup}
          onClose={() => setShowConfirmCancelPopup(false)}
          title="هل أنت متأكد أنك تريد إنهاء عقد الإيجار؟"
          description="سيتم مراجعته من قبل الإدارة، وسيتم التواصل معك لتأكيد الإنهاء. لن يتم إيقاف الوصول إلى الوحدة إلا بعد الموافقة النهائية."
          buttonText="نعم، إرسال الطلب"
          onButtonClick={() => {
            setShowConfirmCancelPopup(false);
            setShowCancelModal(true);
          }}
          cancelButtonText="إلغاء"
          onCancelClick={() => setShowConfirmCancelPopup(false)}
        />

        {/* Cancellation request modal – reason form (shown after confirming in popup) */}
        {showCancelModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !cancelSubmitting && setShowCancelModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">طلب إلغاء العقد</h3>
              <p className="text-sm text-gray-600 mb-4">
                سيتم إرسال طلبك للموافقة من الطرف الآخر. يرجى ذكر السبب (10 أحرف على الأقل).
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="سبب طلب الإلغاء..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                rows={4}
                dir="rtl"
              />
              {cancelError && (
                <p className="mt-2 text-sm text-red-600">{cancelError}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setCancelError(null);
                  }}
                  disabled={cancelSubmitting}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCancelRequest}
                  disabled={cancelSubmitting || cancelReason.trim().length < 10}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </>
  );
}
