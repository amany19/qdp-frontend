'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AddDevicePage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/add-device/step-1');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
    </div>
  );
}
