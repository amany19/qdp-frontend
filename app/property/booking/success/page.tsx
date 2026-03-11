'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

/**
 * Payment Success Screen
 * Design Reference: sucess-checkout-popup.png, confirm-popup-to-view-the-property-with-the-agent.png
 *
 * Shows success message after payment completion
 */

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Auto-redirect after 3 seconds (optional)
    // const timer = setTimeout(() => {
    //   router.push('/home');
    // }, 3000);
    // return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4">
      {/* Success Modal */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Checkmark Circle */}
            <div className="w-32 h-32 rounded-full bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/30 animate-in zoom-in duration-500">
              <Check className="w-16 h-16 text-white stroke-[3]" />
            </div>

            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-success-500/20 animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-relaxed" dir="rtl">
          لقد تم إتمام الدفع بنجاح
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-xs mx-auto" dir="rtl">
          ستقوم بإخطارك فور الموافقة على الموعد
        </p>

        {/* Action Button */}
        <button
          onClick={handleGoHome}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
          dir="rtl"
        >
          الصفحة الرئيسية
        </button>

        {/* Payment ID Reference (optional) */}
        {paymentId && (
          <p className="mt-4 text-xs text-gray-400" dir="ltr">
            Payment ID: {paymentId.slice(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
