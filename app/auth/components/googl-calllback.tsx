'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const code = searchParams.get('code'); 

    if (!code) {
      toast.error('فشل تسجيل الدخول عبر Google');
      router.push('/auth/login');
      return;
    }

    const fetchToken = async () => {
      try {
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback?code=${code}`, {
          method: 'GET',
          credentials: 'include', 
        });
        const data = await res.json();

        login(data.accessToken, data.user); 
        toast.success('تم تسجيل الدخول بنجاح!');
        router.push('/home');
      } catch (err) {
        toast.error('فشل تسجيل الدخول عبر Google');
        router.push('/auth/login');
      }
    };

    fetchToken();
  }, [searchParams, login, router]);

  return <p className="text-center mt-20">جاري تسجيل الدخول...</p>;
}