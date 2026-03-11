'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // If user is already logged in, redirect to home
    // Otherwise, redirect to splash screen
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/splash/1');
    }
  }, [router, isAuthenticated]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  );
}
