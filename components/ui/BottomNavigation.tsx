'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export interface BottomNavigationProps {
  leftNavItems?: NavItem[];
  rightNavItems?: NavItem[];
  showHomeIndicator?: boolean;
  className?: string;
}

export function BottomNavigation({
  leftNavItems = [],
  rightNavItems = [],
  showHomeIndicator = true,
  className = '',
}: BottomNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    return pathname === href || pathname?.startsWith(href + '/');
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
    <nav className={`fixed bottom-0 left-0 right-0 z-40 safe-area-bottom ${className}`}>
      <div className="bg-white px-5 py-3 border-t border-gray-100 rounded-t-4xl shadow-sm">
        <div className="flex justify-between items-end max-w-md mx-auto">
          {/* Left navigation items */}
          {leftNavItems.length > 0 && (
            <div className="flex gap-6">
              {leftNavItems.map(renderNavItem)}
            </div>
          )}

          {/* Right navigation items */}
          {rightNavItems.length > 0 && (
            <div className="flex gap-6">
              {rightNavItems.map(renderNavItem)}
            </div>
          )}
        </div>

        {/* Home indicator */}
        {showHomeIndicator && (
          <div className="flex justify-center mt-2">
            <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
      </div>
    </nav>
  );
}