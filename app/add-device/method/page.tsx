'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import HeaderCard from '@/components/ui/HeaderCard';
import { PaymentMethodSelect, type PaymentMethodId } from '@/components/payment/PaymentMethodSelect';

function AddDeviceMethodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const amount = searchParams.get('amount');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('mastercard');

  useEffect(() => {
    if (!listingId || !amount) {
      toast.error('معلومات الدفع مفقودة');
      router.replace('/add-device/step-1');
    }
  }, [listingId, amount, router]);

  const handleContinueToCheckout = () => {
    if (!listingId || !amount) return;
    router.push(`/add-device/checkout?listingId=${listingId}&amount=${amount}`);
  };

  if (!listingId || !amount) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  const amountNum = parseFloat(amount);

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      <HeaderCard
        title="اختر طريقة الدفع"
        leftButton={
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-5 py-6">
        {/* Cost breakdown - like pay-rent method and add-property step-3 */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-base mb-4 text-right">تكلفة إعلان الجهاز</h3>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between font-bold text-base">
              <span>{amountNum.toLocaleString('ar-QA')} ر.ق</span>
              <span>إجمالي التكلفة</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            رسوم نشر إعلان الجهاز للإيجار
          </p>
        </div>

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

export default function AddDeviceMethodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <AddDeviceMethodContent />
    </Suspense>
  );
}
