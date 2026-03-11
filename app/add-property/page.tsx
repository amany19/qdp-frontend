'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Add Property Entry Point
 * Redirects to Step 1 of the add property wizard
 */
export default function AddPropertyPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/add-property/step-1');
  }, [router]);

  return (
  
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>

  );
}
