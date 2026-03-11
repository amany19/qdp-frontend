'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BottomNavigation } from './BottomNavigation';
import { BottomNavigationPlus } from './BottomNavigationPlus';
import {
  isPlusRoute,
  getNavConfigForUserType,
} from '@/config/navigation';

export function BottomNavWrapper() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userType = useAuthStore((state) => state.user?.userType);

  const hideBottomNav =
    !isAuthenticated ||
    pathname === '/' ||
    pathname?.startsWith('/splash') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/phone-verification') ||
    pathname?.startsWith('/verify-otp') ||
    pathname?.startsWith('/add-property') ||
    pathname?.startsWith('/contract') ||
    pathname?.startsWith('/services/') ||
    pathname?.startsWith('/offers') ||
    pathname?.startsWith('/profile/settings');

  if (hideBottomNav) {
    return null;
  }

  const { leftNavItems, rightNavItems } = getNavConfigForUserType(
    isAuthenticated,
    userType
  );

  if (isPlusRoute(pathname)) {
    return (
      <BottomNavigationPlus
        leftNavItems={leftNavItems}
        rightNavItems={rightNavItems}
        plusButtonVisible={true}
      />
    );
  }

  return (
    <BottomNavigation
      leftNavItems={leftNavItems}
      rightNavItems={rightNavItems}
    />
  );
}
