'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { contractService, type Contract } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight, FileText } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

/**
 * Contract Pending (Owner Signature) Page
 * Shows when the user (tenant) has signed but the owner/landlord has not yet.
 * User is not converted to resident until both parties sign.
 */
export default function ContractPendingPage() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadContracts();
  }, [hasHydrated, isAuthenticated, router]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setContracts([]);
        return;
      }
      const data = await contractService.getMyContracts();
      setContracts(data || []);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Only show contracts where: user is tenant, status is pending_signature (not active), tenant has signed, landlord has NOT signed
  const currentUserId = (authUser as { id?: string; _id?: string })?.id ?? (authUser as { _id?: string })?._id ?? '';
  const pendingOwnerSignature = (contracts || []).filter((c) => {
    if (c.status !== 'pending_signature') return false; // exclude active, draft, etc.
    const tenantId = typeof c.tenantId === 'object' && c.tenantId !== null && '_id' in c.tenantId
      ? (c.tenantId as { _id: string })._id
      : String(c.tenantId ?? '');
    const isTenant = tenantId === currentUserId;
    const tenantSigned = !!(c.electronicSignatureTenant || c.signedAtTenant);
    const landlordSigned = !!(c.electronicSignatureLandlord && c.signedAtLandlord);
    return isTenant && tenantSigned && !landlordSigned;
  });

  const pendingLogSent = useRef(false);
  useEffect(() => {
    if (loading || pendingLogSent.current) return;
    pendingLogSent.current = true;
    const uid = (authUser as { id?: string; _id?: string })?.id ?? (authUser as { _id?: string })?._id ?? '';
    const payload = {
      sessionId: '1a3b6c',
      location: 'contract/pending/page.tsx:filter',
      message: 'Pending page: contracts and filter result',
      data: {
        currentUserId: uid,
        authUserId: (authUser as { id?: string })?.id,
        authUser_id: (authUser as { _id?: string })?._id,
        totalContracts: contracts.length,
        pendingCount: pendingOwnerSignature.length,
        contractsSummary: (contracts || []).slice(0, 10).map((c) => {
          const tid = typeof c.tenantId === 'object' && c.tenantId !== null && '_id' in c.tenantId
            ? (c.tenantId as { _id: string })._id
            : String(c.tenantId ?? '');
          return {
            _id: c._id,
            status: c.status,
            tenantId: tid,
            isTenant: tid === uid,
            tenantSigned: !!(c.electronicSignatureTenant || c.signedAtTenant),
            landlordSigned: !!(c.electronicSignatureLandlord && c.signedAtLandlord),
            hasElectronicTenant: !!c.electronicSignatureTenant,
            hasSignedAtTenant: !!c.signedAtTenant,
          };
        }),
      },
      timestamp: Date.now(),
      hypothesisId: 'H1-H5',
    };
    fetch('http://127.0.0.1:7841/ingest/1a620294-f867-41fe-8dbd-93cde5bb999b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1a3b6c' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [loading, contracts, authUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-24" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <HeaderCard
          title="عقود بانتظار توقيع المالك"
          leftButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>
          }
        />

        <main className="px-5 py-6 space-y-4">
          {pendingOwnerSignature.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">لا توجد عقود بانتظار توقيع المالك</h2>
              <p className="text-gray-600 text-sm mb-4">
                لا توجد عقود تحتاج توقيع المالك فقط. إذا كان العقد موقّعاً من الطرفين، ستجده في وحدتي.
              </p>
              <button
                onClick={() => router.push('/profile')}
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium"
              >
                العودة إلى الملف الشخصي
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-amber-800 text-sm font-medium">
                  لقد وقّعت. بانتظار توقيع المالك فقط — لا يلزمك أي إجراء. سيتم تفعيل العقد وتحويلك إلى ساكن بعد توقيع المالك.
                </p>
              </div>
              {pendingOwnerSignature.map((contract) => {
                const prop = contract.propertyId as { _id?: string; title?: string; titleAr?: string; location?: { area?: string; city?: string } };
                const title = prop?.titleAr || prop?.title || 'وحدة';
                const location = prop?.location ? `${prop.location.area || ''}، ${prop.location.city || ''}`.replace(/^،\s*|،\s*$/g, '').trim() : '';
                return (
                  <div
                    key={contract._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        {location && <p className="text-sm text-gray-500">{location}</p>}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="text-gray-500">نوع العقد:</span> {contract.contractType === 'rent' ? 'إيجار' : 'بيع'}</p>
                      <p><span className="text-gray-500">القيمة:</span> {contract.amount?.toLocaleString('ar-QA')} ريال</p>
                      <p><span className="text-gray-500">رقم العقد:</span> {contract.contractNumber || contract._id.slice(-8)}</p>
                    </div>
                    <p className="text-amber-700 text-sm font-medium mb-3">
                      تم تسجيل توقيعك. بانتظار توقيع المالك فقط.
                    </p>
                    <div className="flex gap-2">
                      {/* الدفع والمتابعة - commented for now
                      <button
                        onClick={() => router.push(`/property/${prop?._id || ''}/booking/checkout?contractId=${contract._id}`)}
                        className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium text-sm"
                      >
                        الدفع والمتابعة
                      </button>
                      */}
                      <button
                        onClick={() => router.push('/profile')}
                        className="py-2.5 px-4 border border-gray-200 rounded-xl font-medium text-sm text-gray-700"
                      >
                        الملف الشخصي
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </main>
      </div>
      <BottomNavigation />
    </>
  );
}
