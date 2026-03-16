'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/** Demo mode: accept any credentials to show the payment process to the client. Set to false for real validation. */
const DEMO_ACCEPT_ANY_CREDENTIALS = true;

const paymentSchema = DEMO_ACCEPT_ANY_CREDENTIALS
  ? z.object({
      cardNumber: z.string().min(1, 'أدخل رقم البطاقة'),
      cardHolderName: z.string().min(1, 'أدخل اسم حامل البطاقة'),
      expiryDate: z.string().min(1, 'أدخل تاريخ الانتهاء'),
      cvv: z.string().min(1, 'أدخل CVV'),
    })
  : z.object({
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

export type PaymentFormData = z.infer<typeof paymentSchema>;

export function getCardBrand(number: string): 'visa' | 'mastercard' | 'card' {
  const cleaned = (number || '').replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  return 'card';
}

interface PaymentCheckoutFormProps {
  amount: number;
  amountDescription: string;
  onSubmit: (data: PaymentFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function PaymentCheckoutForm({
  amount,
  amountDescription,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'إتمام الدفع',
}: PaymentCheckoutFormProps) {
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setValue('expiryDate', value);
  };

  const brand = getCardBrand(cardNumber || '');

  return (
    <>
      {/* Payment Amount Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{amount.toLocaleString('ar-QA')} ر.ق</span>
          <span className="text-gray-600">المبلغ المطلوب</span>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-right">{amountDescription}</p>
      </div>

      {/* Visual Credit Card Display */}
      <div className="mb-8">
        <div className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
          <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md" />
              <div className="text-2xl font-bold">
                {brand === 'visa' ? 'VISA' : brand === 'mastercard' ? 'Mastercard' : 'VISA'}
              </div>
            </div>
            <div className="text-2xl font-mono tracking-wider">
              {cardNumber || '0000 0000 0000 0000'}
            </div>
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="text-xs text-white/70 mb-1" style={{ fontSize: '10px' }}>MM/YY</div>
                <div className="text-base font-mono">{watch('expiryDate') || '00/00'}</div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium uppercase tracking-wide">
                  {watch('cardHolderName') || 'CARDHOLDER NAME'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form id="payment-checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            اسم حامل البطاقة
          </label>
          <input
            {...register('cardHolderName')}
            type="text"
            placeholder="ادخل اسم حامل البطاقة"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent uppercase"
            dir="ltr"
          />
          {errors.cardHolderName && (
            <p className="mt-1 text-sm text-red-500 text-right">{errors.cardHolderName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 text-right">CVV</label>
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

      {/* Fixed Bottom Button - rendered by parent in contract pages for layout consistency */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          type="submit"
          form="payment-checkout-form"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          dir="rtl"
        >
          {isSubmitting ? 'جاري معالجة الدفع...' : submitButtonText}
        </button>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300" />
        </div>
      </div>
    </>
  );
}
