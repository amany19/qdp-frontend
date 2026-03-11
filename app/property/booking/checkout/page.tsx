'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contractService, Contract } from '@/services/contractService';
import { paymentService } from '@/services/paymentService';
import { ArrowRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

/**
 * Payment Checkout Details Screen
 * Design Reference: checkout-details.png (Screen 14)
 *
 * Allows user to enter credit/debit card information and complete payment
 */

// Validation schema for payment form
const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, 'رقم البطاقة غير صحيح')
    .max(19, 'رقم البطاقة غير صحيح')
    .regex(/^[\d\s]+$/, 'رقم البطاقة يجب أن يحتوي على أرقام فقط'),
  cardHolderName: z
    .string()
    .min(3, 'اسم حامل البطاقة مطلوب')
    .regex(/^[a-zA-Z\s]+$/, 'اسم حامل البطاقة يجب أن يحتوي على حروف فقط'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'تاريخ الانتهاء غير صحيح (MM/YY)'),
  cvv: z
    .string()
    .length(3, 'CVV يجب أن يحتوي على 3 أرقام')
    .regex(/^\d{3}$/, 'CVV يجب أن يحتوي على أرقام فقط'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId');

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const cardNumber = watch('cardNumber');

  useEffect(() => {
    if (contractId) {
      loadContract();
    } else {
      toast.error('معرف العقد مفقود');
      router.back();
    }
  }, [contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await contractService.findOne(contractId!);
      setContract(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل تحميل بيانات العقد');
    } finally {
      setLoading(false);
    }
  };

  // Format card number with spaces (every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setValue('cardNumber', formatted);
  };

  // Format expiry date (MM/YY)
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setValue('expiryDate', value);
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!contract) return;

    try {
      setProcessing(true);

      // Split expiry date into month and year
      const [expiryMonth, expiryYear] = data.expiryDate.split('/');

      // Detect card brand
      const cardNumber = data.cardNumber.replace(/\s/g, '');
      const cardBrand = cardNumber.startsWith('4') ? 'visa' :
                        /^5[1-5]/.test(cardNumber) ? 'mastercard' : 'card';

      // Process payment
      const payment = await paymentService.process({
        amount: contract.amount,
        paymentMethod: cardBrand,
        paymentType: 'contract',
        referenceId: contract._id,
        insuranceFee: contract.insuranceAmount || 0,
        cardDetails: {
          cardNumber: cardNumber,
          cardHolderName: data.cardHolderName,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          cvv: data.cvv,
        },
        currency: 'QAR',
      });

      toast.success('تم الدفع بنجاح!');

      // Navigate to success screen
      router.push(`/property/booking/success?paymentId=${payment._id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل الدفع');
    } finally {
      setProcessing(false);
    }
  };

  // Detect card brand from card number
  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    return 'unknown';
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

  return (
    <div className="min-h-screen bg-white pb-32">
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
            بيانات البطاقة
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6" dir="rtl">
        {/* Visual Credit Card Display */}
        <div className="mb-8">
          <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {/* Chip Icon */}
                  <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md">
                    <svg viewBox="0 0 48 40" className="w-full h-full">
                      <rect x="4" y="4" width="40" height="32" rx="3" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
                      <line x1="14" y1="4" x2="14" y2="36" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>
                      <line x1="24" y1="4" x2="24" y2="36" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>
                      <line x1="34" y1="4" x2="34" y2="36" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>
                    </svg>
                  </div>

                  {/* Contactless Icon */}
                  <div className="text-white/80">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Card Brand Logo */}
                <div className="text-2xl font-bold">
                  {getCardBrand(cardNumber || '') === 'visa' ? 'VISA' :
                   getCardBrand(cardNumber || '') === 'mastercard' ? 'Mastercard' : 'VISA'}
                </div>
              </div>

              {/* Card Number */}
              <div className="text-2xl font-mono tracking-wider">
                {cardNumber || '0000 0000 0000 0000'}
              </div>

              {/* Card Footer */}
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="text-xs text-white/70 mb-1" style={{ fontSize: '10px' }}>
                    MM/YY
                  </div>
                  <div className="text-base font-mono">
                    {watch('expiryDate') || '00/00'}
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium uppercase tracking-wide">
                    {watch('cardHolderName') || 'TACCHINO DAVIDE'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
              رقم البطاقة الائتمانية
            </label>
            <input
              {...register('cardNumber')}
              onChange={handleCardNumberChange}
              type="text"
              maxLength={19}
              placeholder="ادخل رقم البطاقة الائتمانية"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              dir="ltr"
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500 text-right">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
              اسم حامل الهوية
            </label>
            <input
              {...register('cardHolderName')}
              type="text"
              placeholder="ادخل اسم حامل الهوية"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent uppercase"
              dir="ltr"
            />
            {errors.cardHolderName && (
              <p className="mt-1 text-sm text-red-500 text-right">{errors.cardHolderName.message}</p>
            )}
          </div>

          {/* Expiry Date & CVV */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
                تاريخ الانتهاء
              </label>
              <input
                {...register('expiryDate')}
                onChange={handleExpiryDateChange}
                type="text"
                maxLength={5}
                placeholder="08/21"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                dir="ltr"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-500 text-right">{errors.expiryDate.message}</p>
              )}
            </div>

            {/* CVV */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
                CVV
              </label>
              <input
                {...register('cvv')}
                type="password"
                maxLength={3}
                placeholder="XXX"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                dir="ltr"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-500 text-right">{errors.cvv.message}</p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={processing}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          dir="rtl"
        >
          {processing ? 'جاري معالجة الدفع...' : 'إتمام الدفع'}
        </button>

        {/* Home indicator */}
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
