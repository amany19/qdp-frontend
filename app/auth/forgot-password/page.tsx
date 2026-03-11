'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@/components/forms';
import { authService } from '@/services/authService';
import toast, { Toaster } from 'react-hot-toast';

// Validation schema
const forgotPasswordSchema = z.object({
  phone: z.string().min(8, 'رقم الهاتف مطلوب'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const phone = data.phone.startsWith('+974') ? data.phone : `+974${data.phone}`;
      await authService.forgotPassword({ phone });

      toast.success('تم إرسال رمز التحقق!');

      // Redirect to OTP verification with forgot-password flag
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}&from=forgot-password`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Toaster position="top-center" />

      {/* Main Content */}
      <div className="px-5 pt-12 pb-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-3">
          استرجاع كلمة السر
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-600 mb-12">
          ادخل رقم الهاتف للحصول على رمز التأكيد
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Input */}
          <Input
            label="رقم الهاتف"
            type="tel"
            placeholder="أدخل رقم الهاتف"
            {...register('phone')}
            error={errors.phone?.message}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            }
          />

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="h-14"
          >
            إرسال
          </Button>
        </form>

        {/* Back to Login Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-primary-500 font-semibold hover:underline"
          >
            العودة لتسجيل الدخول
          </button>
        </p>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}
