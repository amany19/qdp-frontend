import { BottomNavigation } from '@/components/ui/BottomNavigationPlus';
// import { BottomNavBar } from '../ui/BottomNavBar';



export default function ResidentLayout({ children }: { children: React.ReactNode }) {
    const leftNavItems = [
    { href: "/home", label: "الرئيسية", icon: "/icons/home-icon.svg" },
    
  ];

  const rightNavItems = [
    { href: "/appointments", label: "مواعيدي", icon: "/icons/calender-icon.svg" },
    { href: "/profile", label: "حسابي", icon: "/icons/profile-icon.svg" },
  ];

  return (
    <>
      <header></header>
      <main>{children}</main>

      {/* <BottomNavBar leftNavItems={ leftNavItems} rightNavItems={rightNavItems} /> will show resident-specific tabs */}
    </>
  );
}