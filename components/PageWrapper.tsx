'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import GuestLayout from './layout/GuestLayout';
import ResidentLayout from './layout/ResidentLayout';
import UserLayout from './layout/UserLayout';
import { BottomNavWrapper } from './ui/BottomNavWrapper';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.user?.userType);
  const [layout, setLayout] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLayout(<GuestLayout>{children}</GuestLayout>);
    } else if (userType === 'resident') {
      setLayout(<ResidentLayout>{children}</ResidentLayout>);
    } else {
      setLayout(<UserLayout>{children}</UserLayout>);
    }
  }, [isAuthenticated, userType, children]);

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {layout}
      <BottomNavWrapper />
    </>
  );
}