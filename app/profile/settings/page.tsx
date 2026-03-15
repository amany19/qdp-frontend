'use client';

import { useState, useEffect } from 'react';
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
    FileSignature,
} from 'lucide-react'
import HeaderCard from '@/components/ui/HeaderCard'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore';
import { contractService, type Contract } from '@/services/contractService';

interface UserProfile {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    profilePicture?: string;
}

type ContractWithParties = Contract & {
    tenantId?: { _id: string } | string;
    electronicSignatureLandlord?: string;
    signedAtLandlord?: string;
};

export default function SettingsPage() {
    const authUser = useAuthStore((state) => state.user);
    const router = useRouter();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractsLoading, setContractsLoading] = useState(true);

    // Map auth user to profile user format
    const user: UserProfile | null = authUser ? {
        fullName: authUser.fullName,
        phone: authUser.phone,
        email: authUser.email,
        address: 'الدوحة، قطر', // TODO: Get from user profile API
        profilePicture: authUser.profilePicture,
    } : null;

    useEffect(() => {
        if (!authUser?.id) return;
        let cancelled = false;
        const load = async () => {
            try {
                setContractsLoading(true);
                const data = await contractService.getMyContracts();
                if (!cancelled) setContracts(data || []);
            } catch {
                if (!cancelled) setContracts([]);
            } finally {
                if (!cancelled) setContractsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [authUser?.id]);

    // Contracts where current user is tenant and owner has not signed yet
    const pendingOwnerSignature = (contracts || []).filter((c) => {
        const contract = c as ContractWithParties;
        if (contract.status !== 'pending_signature') return false;
        const tenantId = typeof contract.tenantId === 'object' && contract.tenantId !== null && '_id' in contract.tenantId
            ? (contract.tenantId as { _id: string })._id
            : String(contract.tenantId ?? '');
        const tenantSigned = !!(contract.electronicSignatureTenant || contract.signedAtTenant);
        const landlordSigned = !!(contract.electronicSignatureLandlord && contract.signedAtLandlord);
        return tenantId === authUser?.id && tenantSigned && !landlordSigned;
    });
    const showPendingContractTab = !contractsLoading && pendingOwnerSignature.length > 0;

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
                    profilePicture={user?.profilePicture}
                    onEdit={() => router.push('/profile/settings')}
                />
            )}

            {showPendingContractTab && (
                <div className="bg-white mt-2 rounded-xl overflow-hidden">
                    <SettingsItem
                        icon={<FileSignature className="w-5 h-5" />}
                        title="عقد بانتظار توقيع المالك"
                        description="عقدك بانتظار توقيع المالك (المالكية). اضغط لعرض التفاصيل."
                        href="/contract/pending"
                    />
                </div>
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