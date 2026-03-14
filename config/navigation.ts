import type { NavItem } from '@/components/ui/BottomNavigation';

export const ROUTES_WITH_PLUS = ['/appliances', '/properties'] as const;
export const ROUTES_WITH_SIMPLE_NAV = ['/home', '/profile'] as const;

export function isPlusRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROUTES_WITH_PLUS.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

export function isSimpleNavRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return ROUTES_WITH_SIMPLE_NAV.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

// Single source of truth for nav items (icons from public)
export const navItems = {
  home: {
    href: '/home',
    label: 'الرئيسية',
    icon: '/icons/home-icon.svg',
  },
  profile: {
    href: '/profile',
    label: 'حسابي',
    icon: '/icons/profile-icon.svg',
  },
  properties: {
    href: '/properties',
    label: 'الوحدات',
    icon: '/icons/building-icon.svg',
  },
  appointments: {
    href: '/appointments',
    label: 'مواعيدي',
    icon: '/icons/calender-icon.svg',
    activeIcon: '/icons/calendar-icon-bold.svg',
  },
  myUnit: {
    href: '/my-unit',
    label: 'وحدتي',
    icon: '/icons/building-icon.svg',
    activeIcon: '/icons/building-icon-bold.svg',
  },
  services: {
    href: '/services',
    label: 'خدماتي',
    icon: '/icons/briefcase-icon.svg',
  },
  login: {
    href: '/auth/login',
    label: 'تسجيل الدخول',
    icon: '/icons/profile-icon.svg',
  },
} as const;


export const navConfigs = {
  guest: {
    leftNavItems: [navItems.home, navItems.properties] as NavItem[],
    rightNavItems: [navItems.appointments] as NavItem[],
  },
  resident: {
    leftNavItems: [navItems.home, navItems.services] as NavItem[],
    rightNavItems: [navItems.myUnit, navItems.profile] as NavItem[],
  },
  user: {
    leftNavItems: [navItems.home, navItems.properties] as NavItem[],
    rightNavItems: [navItems.appointments, navItems.profile] as NavItem[],
  },
} as const;

export type NavUserType = keyof typeof navConfigs;

export function getNavConfigForUserType(
  isAuthenticated: boolean,
  userType: 'resident' | 'user' | 'admin' | undefined
): { leftNavItems: NavItem[]; rightNavItems: NavItem[] } {
  if (!isAuthenticated) return navConfigs.guest;
  if (userType === 'resident') return navConfigs.resident;
  return navConfigs.user;
}
