'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, OTPInput } from '@/components/forms';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const phone = searchParams.get('phone') || '';
  const fromForgotPassword = searchParams.get('from') === 'forgot-password';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes = 600 seconds
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 5) {
      toast.error('يرجى إدخال رمز التحقق كاملاً');
      return;
    }

    setIsLoading(true);
    try {
      if (fromForgotPassword) {
        // For forgot password flow, just navigate to reset password
        router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}&otp=${otpCode}`);
      } else {
        // For signup flow, verify phone and login
        const response = await authService.verifyPhone({ phone, otp: otpCode });
        login(response.accessToken, response.user);
        toast.success('تم التحقق من رقم الهاتف بنجاح!');
        router.push('/home');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'فشل التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await authService.resendOTP(phone);
      toast.success('تم إرسال رمز جديد!');
      setTimer(600);
      setCanResend(false);
      setOtp(['', '', '', '', '']);
    } catch (error: unknown) {
      toast.error('فشل إرسال الرمز');
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Toaster position="top-center" />

      {/* Main Content */}
      <div className="px-5 pt-12 pb-8 flex flex-col items-center">
        {/* 3D Security Shield Illustration */}
        <div className="mb-8">
          <svg
            className="w-48 h-48"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shield background */}
            <path
              d="M100 20L40 50V90C40 130 100 170 100 170C100 170 160 130 160 90V50L100 20Z"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            {/* Shield gradient overlay */}
            <path
              d="M100 30L50 55V90C50 123 100 155 100 155C100 155 150 123 150 90V55L100 30Z"
              fill="url(#shieldGradient)"
              opacity="0.7"
            />
            {/* Key */}
            <g transform="translate(120, 80) rotate(30)">
              <circle cx="0" cy="0" r="8" fill="#6B7280" />
              <rect x="-2" y="8" width="4" height="20" fill="#6B7280" />
              <rect x="-2" y="18" width="6" height="3" fill="#6B7280" />
              <rect x="-2" y="24" width="6" height="3" fill="#6B7280" />
            </g>
            <defs>
              <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D1D5DB" />
                <stop offset="100%" stopColor="#9CA3AF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Instruction Text */}
        <p className="text-center text-gray-600 text-sm mb-8 px-4">
          أدخل رمز المصادقة المرسل الى رقم الهاتف
        </p>

        {/* OTP Input - 5 boxes */}
        <div className="mb-6">
          <OTPInput
            length={5}
            value={otp}
            onChange={setOtp}
            onComplete={(code) => {
              // Auto-submit when complete
              console.log('OTP Complete:', code);
            }}
          />
        </div>

        {/* Timer / Resend */}
        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium">{formatTime(timer)}</span>
              {' '}
              <span>أعد الإرسال بعد</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="text-sm text-primary-500 font-medium hover:underline disabled:opacity-50"
            >
              إعادة إرسال الرمز
            </button>
          )}
        </div>

        {/* Confirm Button */}
        <div className="w-full px-5">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerify}
            isLoading={isLoading}
            className="h-14"
          >
            تأكيد
          </Button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
