'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/store/authStore';
import { paymentService } from '@/services/paymentService';
import { PaymentCheckoutForm, getCardBrand, type PaymentFormData } from '@/components/payment/PaymentCheckoutForm';
import SuccessPopup from '@/components/ui/SuccessPopup';

/** Demo: skip real API and show success. Set to false to call backend and update DB/admin. */
const DEMO_PAYMENT = false;

interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

interface Booking {
  _id: string;
  bookingType: string;
  installments?: Installment[];
  monthlyAmount?: number;
  numberOfInstallments?: number;
}

function PayRentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const installmentNumberParam = searchParams.get('installmentNumber');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [pendingInstallment, setPendingInstallment] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!bookingId) {
      toast.error('معرف الحجز مفقود');
      router.push('/my-unit');
      return;
    }
    loadBooking();
  }, [bookingId, isAuthenticated, router]);

  const loadBooking = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !bookingId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/user/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        toast.error('فشل تحميل بيانات الحجز');
        router.push('/my-unit');
        return;
      }
      const data: Booking = await res.json();
      setBooking(data);

      if (data.bookingType !== 'rent' || !data.installments?.length) {
        toast.error('لا توجد أقساط لهذا الحجز');
        router.push('/my-unit');
        return;
      }

      const pending = data.installments.filter(
        (i) => i.status !== 'paid' && i.status !== 'cancelled'
      );
      if (!pending.length) {
        toast.error('لا توجد أقساط معلقة للدفع');
        router.push('/my-unit');
        return;
      }

      let target: Installment;
      if (installmentNumberParam) {
        const num = parseInt(installmentNumberParam, 10);
        target = data.installments.find((i) => i.installmentNumber === num) ?? pending[0];
        if (target.status === 'paid' || target.status === 'cancelled') {
          toast.error('هذا القسط مدفوع أو ملغي');
          target = pending[0];
        }
      } else {
        target = pending[0];
      }
      setPendingInstallment(target);
    } catch {
      toast.error('فشل تحميل البيانات');
      router.push('/my-unit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PaymentFormData) => {
    if (!booking || !pendingInstallment) return;

    try {
      setProcessing(true);

      if (DEMO_PAYMENT) {
        await new Promise((r) => setTimeout(r, 800));
        setShowSuccess(true);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        toast.error('يجب تسجيل الدخول');
        return;
      }
      const [expiryMonth, expiryYear] = data.expiryDate.split('/');
      const fullYear = expiryYear.length === 2 ? `20${expiryYear}` : expiryYear;
      const cardNumberClean = data.cardNumber.replace(/\s/g, '');
      const cardBrand = getCardBrand(cardNumberClean);

      await paymentService.process({
        amount: pendingInstallment.amount,
        paymentMethod: cardBrand,
        paymentType: 'installment',
        referenceId: booking._id,
        installmentNumber: pendingInstallment.installmentNumber,
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
    router.push(booking ? `/my-bookings/${booking._id}?paid=1` : '/my-unit');
  };

  if (loading || !pendingInstallment) {
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
          <h1 className="text-lg font-bold text-gray-900">بيانات البطاقة - الإيجار الشهري</h1>
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
          amount={pendingInstallment.amount}
          amountDescription={`الإيجار الشهري للمستأجر - قسط رقم ${pendingInstallment.installmentNumber}`}
          onSubmit={handleSubmit}
          isSubmitting={processing}
          submitButtonText="إتمام الدفع"
        />
      </div>

      <SuccessPopup
        isOpen={showSuccess}
        title="تم الدفع بنجاح"
        description="تم تسجيل دفع القسط الشهري. يمكنك متابعة تفاصيل الدفعات من صفحة وحدتي."
        onClose={handleSuccessClose}
        icon="success"
      />
    </div>
  );
}

export default function PayRentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <PayRentContent />
    </Suspense>
  );
}
