'use client';
import SettingsHeader from '@/app/profile/settings/components/SettingsHeader'
import SettingsItem from '@/app/profile/settings/components/SettingsItem'
import SocialSection from '@/app/profile/settings/components/SocialSection'
import DangerSection from '@/app/profile/settings/components/DangerSection'
import {
    Globe,
    HelpCircle,
    Shield,
    Info,
    FileText,
    ArrowRight,
} from 'lucide-react'
import HeaderCard from '@/components/ui/HeaderCard'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/authStore';
interface UserProfile {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    profilePicture?: string;
}
export default function SettingsPage() {
    const authUser = useAuthStore((state) => state.user);
    // Map auth user to profile user format
    const user: UserProfile | null = authUser ? {
        fullName: authUser.fullName,
        phone: authUser.phone,
        email: authUser.email,
        address: 'الدوحة، قطر', // TODO: Get from user profile API
        profilePicture: authUser.profilePicture,
    } : null;
    const router = useRouter()
    const settingsItems = [
        {
            icon: Globe,
            title: "اللغة",
            description: "يمكنك تغيير لغة التطبيق من هنا",
            href: "/settings/language",
        },
        {
            icon: HelpCircle,
            title: "الدعم",
            description: "تواصل معنا",
            href: "/settings/support",
        },
        {
            icon: Shield,
            title: "سياسة التطبيق",
            description: "",
            href: "/settings/policy",
        },
        {
            icon: Info,
            title: "عن التطبيق",
            description: "",
            href: "/settings/about",
        },
        {
            icon: FileText,
            title: "الشروط والأحكام",
            description: "",
            href: "/settings/terms",
        },
        {
            icon: FileText,
            title: "الشكاوى",
            description: "عرض الشكاوى الخاصة بك",
            href: "/profile/complaints",
        }
    ];
    return (
        <div className="min-h-screen bg-white">
    <HeaderCard
      title="تفاصيل الموعد"
      leftButton={
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-900" />
        </button>
      }

    />
            {authUser && (
                <SettingsHeader
                    name={user?.fullName || ''}
                    location="الدوحة، قطر" //Needs to be modified
                    profilePicture={user?.profilePicture || '/images/default-avatar.png'}
                    onEdit={() => router.push('/profile/settings')}
                />
            )}

            <div className="bg-white mt-2 rounded-xl overflow-hidden">
                {settingsItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <SettingsItem
                            key={index}
                            icon={<Icon className="w-5 h-5" />}
                            title={item.title}
                            description={item.description}
                            href={item.href}
                        />
                    );
                })}
            </div>

            <SocialSection />

            <DangerSection />

        </div>
    )
}