'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { contractService, Contract } from '@/services/contractService';
import { Download, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/store/authStore';

/**
 * Contract Signing Screen (Rental & Sale)
 * Design References:
 * - Book Unit-for-rent-sign-the-contract.png (Screen 12)
 * - Book Unit-for-sale-sign-the-contract.png (Screen 13)
 *
 * This screen displays contract terms and allows electronic signature
 */
function SignContractContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // propertyId from route segment [id] (e.g. /property/69b41.../booking/sign-contract)
  const propertyIdRaw = typeof params?.id === 'string' ? params.id : '';
  const isValidMongoId = (s: string) => /^[a-fA-F0-9]{24}$/.test(s);
  const propertyId = propertyIdRaw && isValidMongoId(propertyIdRaw) ? propertyIdRaw : null;

  const contractType = searchParams.get('type') as 'rent' | 'sale';
  const contractId = searchParams.get('contractId');

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState('');

  // Prevent double execution in React 18 Strict Mode
  const isCreatingContract = useRef(false);

  useEffect(() => {
    if (!isCreatingContract.current) {
      isCreatingContract.current = true;
      loadContract();
    }
  }, [propertyId, contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);

      if (contractId) {
        // Load existing contract
        const data = await contractService.findOne(contractId);
        setContract(data);
      } else if (propertyId && contractType) {
        // propertyId is validated above (Mongo ObjectId shape only)
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          toast.error('يجب تسجيل الدخول لإنشاء العقد');
          router.replace(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }

        // Fetch profile and my contracts once (used for pending check and contract creation)
        const [userRes, myContracts] = await Promise.all([
          fetch(`${API_BASE_URL}/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
          contractService.getMyContracts(),
        ]);
        const userData = userRes.ok ? await userRes.json() : null;
        const currentUserId = userData ? String((userData._id ?? userData.id) ?? '').trim() : '';
        if (!currentUserId) {
          throw new Error('يجب تسجيل الدخول. فشل تحميل بيانات المستخدم.');
        }

        // If user already has a contract for this unit pending owner/admin signature, redirect
        const pendingForThisUnit = (myContracts || []).find((c: Contract) => {
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
        if (pendingForThisUnit) {
          router.replace(`/contract/pending-unit?propertyId=${encodeURIComponent(propertyId)}&contractId=${encodeURIComponent(pendingForThisUnit._id)}`);
          return;
        }

        // Check if user already has an active booking for this property
        const checkResponse = await fetch(`${API_BASE_URL}/user/bookings/check/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (checkResponse.ok) {
          const { hasBooking, booking } = await checkResponse.json();
          if (hasBooking) {
            toast.error('لديك حجز نشط بالفعل لهذا العقار');
            router.push(`/my-bookings/${booking._id}`);
            return;
          }
        }

        // Fetch the property to get price and owner info
        const propertyResponse = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!propertyResponse.ok) {
          throw new Error('فشل تحميل بيانات العقار');
        }

        const property = await propertyResponse.json();

        // Calculate dates
        const startDate = new Date();
        const endDate = contractType === 'rent' ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000) : undefined; // 1 year for rent

        // Amount: property.price or availableFor.rentPrice/salePrice
        const amount =
          Number(property.price) ||
          Number(property.availableFor?.rentPrice) ||
          Number(property.availableFor?.salePrice) ||
          0;

        if (amount <= 0) {
          throw new Error('لم يتم تحديد سعر العقار. يرجى التواصل مع الدعم أو اختيار وحدة أخرى.');
        }

        // Extract landlord ID from property (populated or raw id)
        const rawLandlord = property.userId;
        const landlordId = rawLandlord != null
          ? (typeof rawLandlord === 'object' && rawLandlord !== null && '_id' in rawLandlord
            ? String((rawLandlord as { _id: string })._id)
            : String(rawLandlord))
          : '';
        if (!landlordId) {
          throw new Error('لم يتم العثور على مالك العقار. يرجى التواصل مع الدعم.');
        }

        // Create new draft contract with all required fields
        const contractData: any = {
          propertyId,
          tenantId: currentUserId,
          landlordId,
          contractType,
          startDate: startDate.toISOString(),
          amount,
          insuranceAmount: amount, // Default to 1 month rent or 10% sale price
        };

        // Add rent-specific fields
        if (contractType === 'rent' && endDate) {
          contractData.endDate = endDate.toISOString();
          contractData.numberOfChecks = 12;
        }

        // #region agent log
        const isValidHex24 = (s: unknown) => typeof s === 'string' && /^[a-fA-F0-9]{24}$/.test(s);
        fetch('http://127.0.0.1:7841/ingest/1a620294-f867-41fe-8dbd-93cde5bb999b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1a3b6c' },
          body: JSON.stringify({
            sessionId: '1a3b6c',
            location: 'sign-contract/page.tsx:before-create',
            message: 'POST /contracts payload and property.userId shape',
            data: {
              propertyId,
              contractType,
              landlordId,
              landlordIdValidMongo: isValidHex24(landlordId),
              tenantIdValidMongo: isValidHex24(currentUserId),
              amount: contractData.amount,
              keys: Object.keys(contractData),
              rawLandlordType: typeof rawLandlord,
              rawLandlordKeys: rawLandlord != null && typeof rawLandlord === 'object' ? Object.keys(rawLandlord) : null,
            },
            timestamp: Date.now(),
            hypothesisId: 'H1-H5',
          }),
        }).catch(() => {});
        // #endregion

        const data = await contractService.create(contractData);
        setContract(data);
      } else if (contractType && !propertyId && propertyIdRaw) {
        toast.error('رابط غير صالح. يرجى فتح توقيع العقد من صفحة الوحدة أو من تجديد العقد.');
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      // #region agent log
      if (err.response?.status === 400) {
        fetch('http://127.0.0.1:7841/ingest/1a620294-f867-41fe-8dbd-93cde5bb999b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1a3b6c' },
          body: JSON.stringify({
            sessionId: '1a3b6c',
            location: 'sign-contract/page.tsx:catch-400',
            message: 'POST /contracts 400 response body',
            data: { status: err.response?.status, body: err.response?.data },
            timestamp: Date.now(),
            hypothesisId: 'H3',
          }),
        }).catch(() => {});
      }
      // #endregion
      const msg = (err.response?.data as { message?: string })?.message ?? err.message ?? 'فشل تحميل العقد';
      const duplicateContractMessage = 'لديك عقد نشط بالفعل لهذا العقار. لا يمكنك حجز نفس العقار مرتين.';
      if (err.response?.status === 400 && msg === duplicateContractMessage && propertyId) {
        router.replace(`/contract/pending-unit?propertyId=${encodeURIComponent(propertyId)}`);
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = () => {
    // TODO: Implement PDF download
    toast.success('Downloading contract...');
  };

  const handleSignContract = async () => {
    if (!contract) return;

    // Validate signature
    if (!signature || signature.trim() === '') {
      toast.error('يرجى إدخال توقيعك');
      return;
    }

    try {
      setSigning(true);

      const signatureData = {
        signature: signature.trim(),
        signerRole: 'tenant' as const, // Current user is the tenant/buyer
      };

      const updatedContract = await contractService.sign(contract._id, signatureData);

      // Refetch profile so auth store has current userType (resident only when both parties have signed)
      try {
        const token = localStorage.getItem('accessToken');
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          useAuthStore.getState().updateUser({ userType: profile.userType as 'resident' | 'user' | 'admin' });
        }
      } catch {
        // non-blocking
      }

      if (updatedContract?.status === 'active') {
        toast.success('تم توقيع العقد بنجاح!');
        router.push(`/property/${propertyId || ''}/booking/checkout?contractId=${contract._id}`);
      } else {
        toast.success('تم تسجيل توقيعك. العقد بانتظار توقيع المالك.');
        router.push('/contract/pending');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل في توقيع العقد');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600" dir="rtl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6" dir="rtl">
        <div className="text-center max-w-sm space-y-4">
          <p className="text-red-600 font-medium">لم يتم إنشاء العقد أو العثور عليه</p>
          <p className="text-gray-600 text-sm">
            تأكد من تسجيل الدخول وأن العقار يحتوي سعراً ومالكاً. إن ظهرت رسالة خطأ أعلى الصفحة، اتبعها.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => { setLoading(true); loadContract(); }}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700"
            >
              رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRental = contract.contractType === 'rent';

  return (
    <div className="min-h-screen bg-white pb-48">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold text-gray-900" dir="rtl">
            توقيع العقد
          </h1>

          <button
            onClick={handleDownloadContract}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contract Content */}
      <div className="px-5 py-6 space-y-8" dir="rtl">

        {/* Section 1: Contract Duration / Date */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            {isRental ? '1. مدة العقد' : '1. تاريخ العقد'}
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">
                {new Date(contract.startDate).toLocaleDateString('ar-QA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="text-sm text-gray-600">تبدأ في</span>
            </div>
            {isRental && contract.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {new Date(contract.endDate).toLocaleDateString('ar-QA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-sm text-gray-600">تنتهي فيه</span>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Rental Value / Purchase Value */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            {isRental ? '2. قيمة الايجار' : '2. قيمة الشراء'}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {isRental
              ? `(${contract.amount?.toLocaleString('ar-QA')} ريال قطري) شهرياً تُدفع مقدماً.`
              : `(${contract.amount?.toLocaleString('ar-QA')} ريال قطري) تُدفع دفعة واحدة.`
            }
          </p>
        </section>

        {/* Section 3: Attached Checks */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">3. الشيكات الموثلة</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            يلتزم المستأجر بتسليم ({contract.numberOfChecks || 13}) شيكاً مؤجلاً تغطي مدة العقد وتستحق تأمينها عند التوقيع.
          </p>
        </section>

        {/* Section 4: Residential Complex Change */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">4. تغيير المجمع السكني</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            يحق للمستأجر الانتقال لوحدة مماثلة في مجمع آخر تابع للمؤجر إذا توفرت وحدات شاغرة.
          </p>
        </section>

        {/* Section 5: Commitment Reward */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">5. مكافأة الالتزام</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            إذا التزم المستأجر بسداد الايجار في موعده دون تأخير طوال مدة العقد، يحصل على شهر مجاني في نهاية المدة أو عند التجديد.
          </p>
        </section>

        {/* Section 6: Electronic Signature */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">6. التوقيع الإلكتروني</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            يعد التوقيع الإلكتروني على العقد ملزماً قانونياً للطرفين.
          </p>
        </section>

        {/* Section 7: Insurance */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">7. التأمين</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            تأمين بقيمة شهر ايجار، يُسترد عند نهاية العقد إذا لم تكن هناك أضرار.
          </p>
        </section>

        {/* Additional Terms from backend */}
        {contract.terms && contract.terms.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-900">شروط إضافية</h2>
            <ul className="space-y-2">
              {contract.terms.map((term, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed">
                  • {term}
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

      {/* Fixed Bottom Signature & Button */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-200 p-5 z-50 space-y-4">
        {/* Signature Input */}
        <div dir="rtl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التوقيع (اكتب اسمك الكامل)
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl"
            style={{ fontFamily: 'cursive' }}
            dir="rtl"
          />
          {signature && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              المعاينة: <span style={{ fontFamily: 'cursive', fontSize: '16px' }}>{signature}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleSignContract}
          disabled={signing || !signature.trim()}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          dir="rtl"
        >
          {signing ? 'جاري التوقيع...' : 'وقع الآن'}
        </button>

        {/* Home indicator */}
        <div className="mt-2 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export default function SignContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <SignContractContent />
    </Suspense>
  );
}
