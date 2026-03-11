'use client';

import { usePathname } from 'next/navigation';
import MobileOnlyWrapper from './MobileOnlyWrapper';

/**
 * Conditional Mobile Wrapper
 * Applies mobile-only restriction to user pages
 * Excludes admin panel routes
 */

interface ConditionalMobileWrapperProps {
  children: React.ReactNode;
}

export default function ConditionalMobileWrapper({ children }: ConditionalMobileWrapperProps) {
  const pathname = usePathname();

  // Check if current route is admin panel
  const isAdminRoute = pathname?.startsWith('/admin');

  // Apply mobile-only wrapper for user pages
  // Skip wrapper for admin panel
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return <MobileOnlyWrapper>{children}</MobileOnlyWrapper>;
}
