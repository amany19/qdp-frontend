'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { contractService, type Contract } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight, FileText } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

/**
 * Shown when the user tries to start a new contract for a unit
 * but already has a signed contract for that unit pending owner/admin signature.
 */
export default function PendingUnitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const contractIdParam = searchParams.get('contractId');
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!propertyId) {
      setLoading(false);
      return;
    }
    loadContract();
  }, [isAuthenticated, propertyId, contractIdParam, router]);

  const loadContract = async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      if (contractIdParam) {
        const data = await contractService.findOne(contractIdParam);
        const propId = typeof data.propertyId === 'object' && data.propertyId !== null && '_id' in data.propertyId
          ? (data.propertyId as { _id: string })._id
          : String(data.propertyId);
        if (propId === propertyId) setContract(data);
        else setContract(null);
      } else {
        const list = await contractService.getMyContracts();
        const currentUserId = authUser?.id;
        const pending = (list || []).find((c) => {
          if (c.status !== 'pending_signature') return false;
          const tid = typeof c.tenantId === 'object' && c.tenantId !== null && '_id' in c.tenantId
            ? (c.tenantId as { _id: string })._id
            : String(c.tenantId);
          const tenantSigned = !!(c.electronicSignatureTenant || c.signedAtTenant);
          const landlordSigned = !!(c.electronicSignatureLandlord && c.signedAtLandlord);
          const pid = typeof c.propertyId === 'object' && c.propertyId !== null && '_id' in c.propertyId
            ? (c.propertyId as { _id: string })._id
            : String(c.propertyId);
          return pid === propertyId && tid === currentUserId && tenantSigned && !landlordSigned;
        });
        setContract(pending || null);
      }
    } catch {
      setContract(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (!propertyId && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 pb-24" dir="rtl">
        <p className="text-gray-600 text-center mb-4">رابط غير صالح أو لم يتم تحديد الوحدة.</p>
        <button
          onClick={() => router.push('/contract/pending')}
          className="py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium"
        >
          عرض عقودي المعلقة
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-24" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  const prop = contract?.propertyId as { _id?: string; title?: string; titleAr?: string; location?: { area?: string; city?: string } } | undefined;
  const title = prop?.titleAr || prop?.title || 'هذه الوحدة';

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <HeaderCard
          title="عقد قائم لهذه الوحدة"
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

        <main className="px-5 py-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  لديك عقد موقع لهذه الوحدة بالفعل
                </h1>
                <p className="text-amber-800 text-sm font-medium">
                  بانتظار توقيع المالك أو الإدارة — لا يمكن إنشاء عقد جديد لنفس الوحدة
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-6">
              تم تسجيل توقيعك مسبقاً على عقد لهذه الوحدة. العقد حالياً بانتظار توقيع المالك. عند اكتمال التوقيعين سيتم تفعيل العقد وستظهر الوحدة في «وحدتي».
            </p>
            {contract && (
              <div className="bg-white/80 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <p><span className="text-gray-500">الوحدة:</span> {title}</p>
                <p><span className="text-gray-500">نوع العقد:</span> {contract.contractType === 'rent' ? 'إيجار' : 'بيع'}</p>
                <p><span className="text-gray-500">القيمة:</span> {contract.amount?.toLocaleString('ar-QA')} ريال</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/contract/pending')}
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium inline-flex items-center justify-center gap-2"
              >
                عرض عقودي المعلقة
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/properties')}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700"
              >
                تصفح وحدات أخرى
              </button>
              <button
                onClick={() => router.back()}
                className="w-full py-2.5 px-4 text-gray-500 text-sm font-medium"
              >
                رجوع
              </button>
            </div>
          </div>
        </main>
      </div>
      <BottomNavigation />
    </>
  );
}
