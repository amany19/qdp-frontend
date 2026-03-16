'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { contractService, type Contract } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { paymentService } from '@/services/paymentService';
import { PaymentCheckoutForm, getCardBrand, type PaymentFormData } from '@/components/payment/PaymentCheckoutForm';
import SuccessPopup from '@/components/ui/SuccessPopup';

/** Demo: skip real API and show success. Set to false to call backend and update DB/admin. */
const DEMO_PAYMENT = false;

function PayInstallmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const monthlyAmount =
    contract != null
      ? contract.amount / (contract.numberOfChecks || 12)
      : 0;

  const handleSubmit = async (data: PaymentFormData) => {
    if (!contract) return;

    try {
      setProcessing(true);

      if (DEMO_PAYMENT) {
        await new Promise((r) => setTimeout(r, 800));
        setShowSuccess(true);
        return;
      }

      const [expiryMonth, expiryYear] = data.expiryDate.split('/');
      const fullYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear;
      const cardNumberClean = data.cardNumber.replace(/\s/g, '');
      const cardBrand = getCardBrand(cardNumberClean);

      await paymentService.process({
        amount: monthlyAmount,
        paymentMethod: cardBrand,
        paymentType: 'contract',
        referenceId: contract._id,
        insuranceFee: contract.insuranceAmount ?? 0,
        cardDetails: {
          cardNumber: cardNumberClean,
          cardHolderName: data.cardHolderName,
          expiryMonth,
          expiryYear: fullYear,
          cvv: data.cvv,
        },
        currency: 'QAR',
      });

      setShowSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      const text = Array.isArray(msg) ? msg.join(', ') : msg || 'فشل الدفع';
      toast.error(text);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/my-unit');
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
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">بطاقة اختبار</p>
            <p className="text-xs text-blue-800" dir="ltr">Card: 4111 1111 1111 1111 | Expiry: 12/25 | CVV: 123</p>
          </div>
        )}

        <PaymentCheckoutForm
          amount={monthlyAmount}
          amountDescription="القسط الشهري لمالك العقار - دفعة شهرية حسب العقد"
          onSubmit={handleSubmit}
          isSubmitting={processing}
          submitButtonText="إتمام الدفع"
        />
      </div>

      <SuccessPopup
        isOpen={showSuccess}
        title="تم الدفع بنجاح"
        description="تم تسجيل الدفعة الشهرية. يمكنك متابعة التفاصيل من وحدتي أو الملف الشخصي."
        onClose={handleSuccessClose}
        icon="success"
      />
    </div>
  );
}

export default function PayInstallmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <PayInstallmentContent />
    </Suspense>
  );
}
