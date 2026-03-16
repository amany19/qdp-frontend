import { BottomNavigation } from '@/components/ui/BottomNavigationPlus';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const leftNavItems = [
    { href: "/home", label: "الرئيسية", icon: "/icons/home-icon.svg" },
    { href: "/properties", label: "الوحدات", icon: "/icons/building-icon.svg" },
  ];

  const rightNavItems = [
    { href: "/appointments", label: "مواعيدي", icon: "/icons/calender-icon.svg" },
    { href: "/profile", label: "حسابي", icon: "/icons/profile-icon.svg" },
  ];

  return (
    <>
      <header></header>
      <main>{children}</main>
      {/* <BottomNavigation leftNavItems={leftNavItems} rightNavItems={rightNavItems} /> */}
    </>
  );
}