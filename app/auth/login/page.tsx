'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@/components/forms';
import { PhoneInputWithCountryCode } from '@/components/forms/PhoneInputWithCountryCode';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { getCountryCallingCode } from 'react-phone-number-input';

// Validation schema
const loginSchema = z.object({
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('QA'); // Default to Qatar
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setPhoneError('رقم الهاتف مطلوب ويجب أن يكون 8 أرقام على الأقل');
      return;
    }

    setPhoneError('');
    setIsLoading(true);
    try {
      const callingCode = getCountryCallingCode(countryCode as any);
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

      const response = await authService.login({
        phone: fullPhoneNumber,
        password: data.password,
      });

      login(response.accessToken, response.user);
      toast.success('تم تسجيل الدخول بنجاح!');
      router.push('/home');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };
const handleGoogleLogin = () => {

  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Toaster position="top-center" />

      {/* Main Content */}
      <div className="px-5 pt-12 pb-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-12">
          تسجيل الدخول
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Phone Input */}
          <PhoneInputWithCountryCode
            label="رقم الهاتف"
            placeholder="أدخل رقم الهاتف"
            phoneValue={phoneNumber}
            countryCode={countryCode}
            onPhoneChange={(value) => {
              setPhoneNumber(value);
              setPhoneError('');
            }}
            onCountryCodeChange={setCountryCode}
            error={phoneError}
          />

          {/* Password Input */}
          <Input
            label="كلمة السر"
            type={showPassword ? 'text' : 'password'}
            placeholder="أدخل كلمة السر"
            {...register('password')}
            error={errors.password?.message}
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            }
          />

          {/* Forgot Password Link */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              هل نسيت كلمة السر؟
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              أو
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Login */}
          <div>
            <p className="text-center text-sm text-gray-600 mb-3">
              الاستمرار باستخدام
            </p>
            <div className="flex gap-3">
              <button
               onClick={handleGoogleLogin}
                type="button"
                className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex-1 py-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-6 h-14"
          >
            تسجيل دخول
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-primary-500 font-semibold hover:underline"
          >
            إنشاء حساب
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
