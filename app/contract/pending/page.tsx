'use client';

import { useState, useEffect } from 'react';
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
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadContracts();
  }, [isAuthenticated, router]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getMyContracts();
      setContracts(data || []);
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Pending owner signature: user is tenant, contract is pending_signature, landlord has not signed
  const currentUserId = authUser?.id;
  const pendingOwnerSignature = (contracts || []).filter((c) => {
    if (c.status !== 'pending_signature') return false;
    const tenantId = typeof c.tenantId === 'object' && c.tenantId !== null && '_id' in c.tenantId
      ? (c.tenantId as { _id: string })._id
      : String(c.tenantId);
    const isTenant = tenantId === currentUserId;
    const landlordSigned = !!(c.electronicSignatureLandlord && c.signedAtLandlord);
    return isTenant && !landlordSigned;
  });

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
              <h2 className="text-lg font-bold text-gray-900 mb-2">لا توجد عقود بانتظار التوقيع</h2>
              <p className="text-gray-600 text-sm mb-4">
                جميع عقودك إما نشطة أو مكتملة. إذا وقّعت عقداً للتو، سيظهر هنا حتى يوقّع المالك.
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
                  العقد بانتظار توقيع المالك (المالكية). سيتم تفعيل العقد وتحويلك إلى ساكن بعد توقيع الطرفين.
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
                      بانتظار توقيع المالك — تم تسجيل توقيعك
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/property/${prop?._id || ''}/booking/checkout?contractId=${contract._id}`)}
                        className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium text-sm"
                      >
                        الدفع والمتابعة
                      </button>
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
