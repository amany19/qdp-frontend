'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Mobile-Only Wrapper Component
 * Restricts access to mobile devices only
 * Shows desktop blocker message on larger screens
 */

interface MobileOnlyWrapperProps {
  children: React.ReactNode;
}

export default function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const [isMobile, setIsMobile] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      // Check screen width (mobile = max 768px)
      const screenWidth = window.innerWidth;
      const isMobileWidth = screenWidth <= 768;

      // Check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

      // Device is mobile if either condition is true
      const mobile = isMobileWidth || isMobileAgent;

      setIsMobile(mobile);
      setIsLoading(false);
    };

    checkDevice();

    // Re-check on window resize
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Show desktop blocker if not mobile
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* QDP Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="QDP"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          {/* Mobile Phone Icon */}
          <div className="mb-6 flex justify-center">
            <svg
              className="w-20 h-20 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>

          {/* English Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Mobile App Only
          </h1>
          <p className="text-gray-600 mb-6">
            This application is designed for mobile devices only. Please access it from your smartphone for the best experience.
          </p>

          {/* Arabic Message */}
          <div className="border-t border-gray-200 pt-6" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              تطبيق الهاتف المحمول فقط
            </h2>
            <p className="text-gray-600">
              هذا التطبيق مصمم للأجهزة المحمولة فقط. يرجى الوصول إليه من هاتفك الذكي للحصول على أفضل تجربة.
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              📱 Scan QR code with your phone
            </p>
            <p className="text-sm text-gray-600" dir="rtl">
              📱 امسح رمز الاستجابة السريعة بهاتفك
            </p>
          </div>

          {/* Admin Panel Link */}
          <div className="mt-6">
            <a
              href="/admin/login"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Admin Panel Access →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show app for mobile devices
  return <>{children}</>;
}
