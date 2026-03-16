'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/store/authStore';
import { PaymentMethodSelect, type PaymentMethodId } from '@/components/payment/PaymentMethodSelect';

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
}

function PayRentMethodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const installmentNumberParam = searchParams.get('installmentNumber');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [pendingInstallment, setPendingInstallment] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('mastercard');

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

      const pending = data.installments.filter((i) => i.status !== 'paid' && i.status !== 'cancelled');
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

  const handleContinueToCheckout = () => {
    if (!booking || !pendingInstallment) return;
    const params = new URLSearchParams({ bookingId: booking._id });
    params.set('installmentNumber', String(pendingInstallment.installmentNumber));
    router.push(`/contract/pay-rent?${params.toString()}`);
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
          <h1 className="text-lg font-bold text-gray-900">الإيجار الشهري للمستأجر</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Cost breakdown - step-3 style */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-base mb-4 text-right">تكلفة القسط</h3>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between font-bold text-base">
              <span>{pendingInstallment.amount.toLocaleString('ar-QA')} ر.ق</span>
              <span>إجمالي التكلفة (القسط #{pendingInstallment.installmentNumber})</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            الإيجار الشهري للمستأجر
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

export default function PayRentMethodPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
        </div>
      }
    >
      <PayRentMethodContent />
    </Suspense>
  );
}
