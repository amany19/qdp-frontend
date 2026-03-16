'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import HeaderCard from '@/components/ui/HeaderCard';
import { paymentService } from '@/services/paymentService';
import SuccessPopup from '@/components/ui/SuccessPopup';
import { PaymentCheckoutForm, getCardBrand, type PaymentFormData } from '@/components/payment/PaymentCheckoutForm';

function AddDeviceCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const amount = searchParams.get('amount');

  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!listingId || !amount) {
      toast.error('معلومات الدفع غير صحيحة');
      router.push('/add-device/step-1');
    }
  }, [listingId, amount, router]);

  const handleSubmit = async (data: PaymentFormData) => {
    if (!listingId || !amount) return;
    try {
      setProcessing(true);
      const [expiryMonth, expiryYear] = data.expiryDate.split('/');
      const fullYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear;
      const cardNumberClean = data.cardNumber.replace(/\s/g, '');
      const cardBrand = getCardBrand(cardNumberClean);

      await paymentService.process({
        amount: parseFloat(amount),
        paymentMethod: cardBrand,
        paymentType: 'appliance_listing',
        referenceId: listingId,
        cardDetails: {
          cardNumber: cardNumberClean,
          cardHolderName: data.cardHolderName,
          expiryMonth,
          expiryYear: fullYear,
          cvv: data.cvv,
        },
        currency: 'QAR',
      });

      sessionStorage.removeItem('pendingDeviceListingId');
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'فشل الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push('/appliances');
  };

  if (!listingId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      <HeaderCard
        title="دفع إعلان الجهاز"
        leftButton={
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
        }
      />
      <div className="px-5 py-6">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-2xl font-bold">{amount} ر.ق</span>
            <span className="text-gray-600">المبلغ المطلوب</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">رسوم نشر إعلان الجهاز</p>
        </div>
        <PaymentCheckoutForm
          amount={parseFloat(amount)}
          amountDescription="نشر إعلان جهاز للإيجار"
          onSubmit={handleSubmit}
          isSubmitting={processing}
          submitButtonText="إتمام الدفع"
        />
      </div>
      <SuccessPopup
        isOpen={showSuccess}
        title="تم الدفع بنجاح"
        description="تم نشر إعلان الجهاز. سيظهر في قائمة الأجهزة للإيجار."
        onClose={handleSuccessClose}
        icon="success"
      />
    </div>
  );
}

export default function AddDeviceCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <AddDeviceCheckoutContent />
    </Suspense>
  );
}
