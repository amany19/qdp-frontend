'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractService, type Contract } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { PaymentMethodSelect, type PaymentMethodId } from '@/components/payment/PaymentMethodSelect';

function PayInstallmentMethodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('mastercard');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!contractId) {
      toast.error('معرف العقد مفقود');
      router.push('/profile');
      return;
    }
    loadContract();
  }, [contractId, isAuthenticated, hasHydrated, router]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await contractService.findOne(contractId!);
      setContract(data);
    } catch {
      toast.error('فشل تحميل بيانات العقد');
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  const monthlyAmount = contract != null ? contract.amount / (contract.numberOfChecks || 12) : 0;

  const handleContinueToCheckout = () => {
    if (!contractId) return;
    router.push(`/contract/pay-installment?contractId=${contractId}`);
  };

  if (loading || !contract) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">القسط الشهري لمالك العقار</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Cost breakdown - step-3 style */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-base mb-4 text-right">تكلفة القسط</h3>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between font-bold text-base">
              <span>{monthlyAmount.toLocaleString('ar-QA')} ر.ق</span>
              <span>إجمالي التكلفة (القسط الشهري)</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            القسط الشهري لمالك العقار - دفعة شهرية حسب العقد
          </p>
        </div>

        {/* Payment method selection - like add-property step-3 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-4 text-right">
            اختر طريقة الدفع
          </label>
          <PaymentMethodSelect selectedMethod={paymentMethod} onSelect={setPaymentMethod} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          type="button"
          onClick={handleContinueToCheckout}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
          dir="rtl"
        >
          إتمام الدفع
        </button>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

export default function PayInstallmentMethodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <PayInstallmentMethodContent />
    </Suspense>
  );
}
