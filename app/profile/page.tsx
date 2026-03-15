// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Settings, ArrowRight } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { contractService } from '@/services/contractService';
import { useAuthStore } from '@/store/authStore';
import { useAppSettings } from '@/hooks/useAppSettings';
import { API_BASE_URL } from '@/lib/config';
import { getProfilePictureUrl } from '@/lib/profilePicture';
import HeaderCard from '@/components/ui/HeaderCard';


// Import types
import { UserProfile, Contract, PropertyListing, TabType } from '@/types/profile';
import AccountTab from './components/tabs/AccountTab';
import UnitsTab from './components/tabs/UnitsTab';
import AdsTab from './components/tabs/AdsTab';
import OffersTab from './components/tabs/OffersTab';
import AppointmentsTab from './components/tabs/AppointmentsTab';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [myAds, setMyAds] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user from auth store
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const userType = useAuthStore((state) => state.user?.userType);

  // Get app settings
  const { settings } = useAppSettings();

  // Map auth user to profile user format
  const user: UserProfile | null = authUser ? {
    fullName: authUser.fullName,
    phone: authUser.phone,
    email: authUser.email,
    address: 'الدوحة، قطر', // TODO: Get from user profile API
    profilePicture: authUser.profilePicture,
  } : null;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load contracts on mount (for "pending owner signature" card) and when units tab is selected
    if (activeTab === 'units' || contracts.length === 0) {
      loadContracts();
    }
    if (settings.showMyAdsTab && userType !== 'resident' && activeTab === 'ads') {
      loadMyAds();
    }
  }, [activeTab, isAuthenticated, router]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getMyContracts();
      setContracts(data);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/properties/my-listings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMyAds(data);
      }
    } catch (error) {
      console.error('Failed to load my ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const tabs = [
    { id: 'account' as TabType, label: 'حسابي', show: true },
    { id: 'units' as TabType, label: 'وحدتي', show: userType === 'resident' },
    { id: 'appointments' as TabType, label: 'مواعيدي', show: userType === 'resident' },
    { id: 'ads' as TabType, label: 'إعلاناتي', show: settings.showMyAdsTab && userType !== 'resident' },
  ].filter(tab => tab.show);

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        {/* Header */}
        <HeaderCard
          title="الملف الشخصي"
          leftButton={
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>
          }
          rightButton={
            <button
              onClick={() => router.push('/profile/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-900" />
            </button>
          }
        />

        {/* Profile Header */}
        <div className="bg-white px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {getProfilePictureUrl(user?.profilePicture) ? (
                <Image
                  src={getProfilePictureUrl(user?.profilePicture)!}
                  alt={user?.fullName ?? ''}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {user?.fullName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{user?.fullName}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user?.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 py-6">
          {activeTab === 'account' && (
            <>
              {(() => {
                const currentUserId = authUser?.id;
                type ContractWithParties = Contract & { tenantId?: { _id: string } | string; electronicSignatureLandlord?: string; signedAtLandlord?: string; electronicSignatureTenant?: string; signedAtTenant?: string };
                const pendingOwnerSignature = (contracts || []).filter((c) => {
                  const contract = c as ContractWithParties;
                  if (contract.status !== 'pending_signature') return false;
                  const tenantId = typeof contract.tenantId === 'object' && contract.tenantId !== null && '_id' in contract.tenantId
                    ? (contract.tenantId as { _id: string })._id
                    : String(contract.tenantId ?? '');
                  const tenantSigned = !!(contract.electronicSignatureTenant || contract.signedAtTenant);
                  const landlordSigned = !!(contract.electronicSignatureLandlord && contract.signedAtLandlord);
                  return tenantId === currentUserId && tenantSigned && !landlordSigned;
                });
                return pendingOwnerSignature.length > 0 ? (
                  <div className="mb-4">
                    <button
                      onClick={() => router.push('/contract/pending')}
                      className="w-full text-right bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
                    >
                      <p className="text-amber-800 font-medium">عقدك بانتظار توقيع المالك</p>
                      <p className="text-amber-700 text-sm mt-1">اضغط لعرض التفاصيل والمتابعة</p>
                    </button>
                  </div>
                ) : null;
              })()}
              <AccountTab user={user} onLogout={handleLogout} />
            </>
          )}
          
          {activeTab === 'units' && (
            <UnitsTab contracts={contracts} loading={loading} userType={userType} />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab />
          )}
          
          {activeTab === 'offers' && (
            <OffersTab />
          )}

          {settings.showMyAdsTab && userType !== 'resident' && activeTab === 'ads' && (
            <AdsTab ads={myAds} loading={loading} />
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}