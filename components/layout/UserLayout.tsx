import { BottomNavigation } from '@/components/ui/BottomNavigationPlus';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const leftNavItems = [
    { href: "/home", label: "الرئيسية", icon: "/images/bottom-nav/home.png" },
    { href: "/properties", label: "الوحدات", icon: "/images/bottom-nav/building-4.png" },
  ];

  const rightNavItems = [
    { href: "/appointments", label: "مواعيدي", icon: "/images/bottom-nav/my-appointments.png" },
    { href: "/profile", label: "حسابي", icon: "/images/bottom-nav/profile.png" },
  ];

  return (
    <>
      <header></header>
      <main>{children}</main>
      {/* <BottomNavigation leftNavItems={leftNavItems} rightNavItems={rightNavItems} /> */}
    </>
  );
}