'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

/** Derives the bold icon path from the regular icon (e.g. /icons/home-icon.svg → /icons/home-icon-bold.svg) */
function getBoldIconPath(iconPath: string): string {
  return iconPath.replace(/(\.\w+)$/, '-bold$1');
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Optional. If omitted, active state uses icon-bold from the same folder. */
  activeIcon?: string;
}

export interface BottomNavigationPlusProps {
  leftNavItems?: NavItem[];
  rightNavItems?: NavItem[];
  onPlusClick?: () => void;
  plusButtonVisible?: boolean;
  showHomeIndicator?: boolean;
  className?: string;
}

export function BottomNavigationPlus({
  leftNavItems = [],
  rightNavItems = [],
  onPlusClick,
  plusButtonVisible = true,
  showHomeIndicator = true,
  className = '',
}: BottomNavigationPlusProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handlePlusClick = () => {
    if (onPlusClick) {
      onPlusClick();
    } else if (pathname === '/appliances' || pathname?.startsWith('/appliances/')) {
      router.push('/add-device');
    } else {
      router.push('/add-property'); // Properties page or default
    }
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const iconSrc = active
      ? (item.activeIcon ?? getBoldIconPath(item.icon))
      : item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className="flex flex-col items-center justify-center min-w-[60px] transition-all hover:opacity-80"
      >
        <div className="relative w-6 h-6 mb-1">
          <Image
            src={iconSrc}
            alt={item.label}
            width={24}
            height={24}
            className="w-full h-full object-contain transition-all"
            style={{ opacity: active ? 1 : 0.6 }}
          />
        </div>
        <span
          className={`text-[10px] transition-colors ${
            active ? 'text-black font-medium' : 'text-gray-500'
          }`}
          dir="rtl"
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Floating Plus Button */}
      {plusButtonVisible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handlePlusClick}
            className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
            aria-label="إضافة"
          >
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <nav className={`fixed bottom-0 left-0 right-0 z-40 safe-area-bottom ${className}`}>
        <div 
          className="relative h-24"
          style={{ filter: 'drop-shadow(0 -2px 8px rgba(0,0,0,0.1))' }}
        >
          {/* Curved Background */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 375 96"
            preserveAspectRatio="none"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,16
                 Q 0,0 16,0
                 L 135,0
                 Q 145,0 150,10
                 Q 162,30 187.5,30
                 Q 213,30 225,10
                 Q 230,0 240,0
                 L 359,0
                 Q 375,0 375,16
                 L 375,96
                 L 0,96
                 Z"
              fill="white"
            />
          </svg>

          {/* Navigation Items */}
          <div className="relative flex justify-between items-end h-20 max-w-md mx-auto px-6 pt-2">
            {/* Left navigation items */}
            {leftNavItems.length > 0 && (
              <div className="flex gap-6 pb-2">
                {leftNavItems.map(renderNavItem)}
              </div>
            )}

            {/* Right navigation items */}
            {rightNavItems.length > 0 && (
              <div className="flex gap-6 pb-2">
                {rightNavItems.map(renderNavItem)}
              </div>
            )}
          </div>

          {/* Home indicator */}
          {showHomeIndicator && (
            <div className="relative flex justify-center pb-2">
              <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}