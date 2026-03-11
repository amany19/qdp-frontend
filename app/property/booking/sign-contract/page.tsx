'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { contractService, Contract } from '@/services/contractService';
import { Download, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Get propertyId from URL path (from booking entry page navigation)
  const pathParts = window.location.pathname.split('/');
  const propertyId = pathParts[2]; // /property/[id]/booking/sign-contract

  const contractType = searchParams.get('type') as 'rent' | 'sale';
  const contractId = searchParams.get('contractId');

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadContract();
  }, [propertyId, contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);

      if (contractId) {
        // Load existing contract
        const data = await contractService.findOne(contractId);
        setContract(data);
      } else if (propertyId && contractType) {
        // Create new draft contract
        const data = await contractService.create({
          propertyId,
          contractType,
          amount: 0, // Will be populated from property data
        });
        setContract(data);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to load contract');
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

    try {
      setSigning(true);

      // TODO: Implement actual signature capture
      // For now, using a placeholder signature
      const signatureData = {
        signature: 'electronic_signature_placeholder',
      };

      await contractService.sign(contract._id, signatureData);

      toast.success('Contract signed successfully!');

      // Navigate to payment screen
      router.push(`/property/booking/checkout?contractId=${contract._id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to sign contract');
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500" dir="rtl">لم يتم العثور على العقد</p>
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

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-200 p-5 z-50">
        <button
          onClick={handleSignContract}
          disabled={signing}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          dir="rtl"
        >
          {signing ? 'جاري التوقيع...' : 'وقع الآن'}
        </button>

        {/* Home indicator */}
        <div className="mt-4 flex justify-center">
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
