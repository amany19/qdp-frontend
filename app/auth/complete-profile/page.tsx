'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Input, Button } from '@/components/forms';
import { PhoneInputWithCountryCode } from '@/components/forms/PhoneInputWithCountryCode';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { getCountryCallingCode } from 'react-phone-number-input';

interface CompleteProfileData {
  identityNumber: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [countryCode, setCountryCode] = useState('QA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileData>();

  const onSubmit = async (data: CompleteProfileData) => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setPhoneError('رقم الهاتف مطلوب');
      return;
    }

    try {
      setIsLoading(true);

      const callingCode = getCountryCallingCode(countryCode as any);
      const fullPhone = `+${callingCode}${phoneNumber}`;

      const response = await authService.completeProfile({
        phone: fullPhone,
        identityNumber: data.identityNumber,
      });

      login(response.accessToken, response.user);

      toast.success('تم إكمال الملف الشخصي بنجاح');

      router.push('/home');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'حدث خطأ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Toaster position="top-center" />

      <div className="px-5 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-12">
          إكمال الملف الشخصي
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

          <Input
            label="رقم الهوية"
            placeholder="أدخل رقم الهوية"
            {...register('identityNumber', { required: 'رقم الهوية مطلوب' })}
            error={errors.identityNumber?.message}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-6 h-14"
          >
            إكمال التسجيل
          </Button>

        </form>
      </div>
    </div>
  );
}