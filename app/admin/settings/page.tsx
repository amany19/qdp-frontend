'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '@/store/adminAuthStore';

type TabType = 'app-control' | 'profile';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('app-control');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // App Settings
  const [settings, setSettings] = useState({
    showBottomNavAd: true,
    showMyAdsTab: true,
  });

  // Admin Profile
  const adminUser = useAdminAuthStore((state) => state.admin);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    fullName: '',
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = () => {
    if (adminUser) {
      setProfileData({
        username: adminUser.username || '',
        email: adminUser.email || '',
        fullName: adminUser.fullName || '',
      });
    }
  };

  const handleToggle = (key: 'showBottomNavAd' | 'showMyAdsTab') => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem('app-settings', JSON.stringify(settings));
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // TODO: Call API to update admin profile
      // await adminService.updateProfile(profileData);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('الرجاء ملء جميع حقول كلمة المرور');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      setSaving(true);
      // TODO: Call API to change password
      // await adminService.changePassword(passwordData);
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('فشل في تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  const renderAppControlTab = () => (
    <>
      <GlassCard style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '24px'
        }}>
          التحكم في عناصر التطبيق
        </h2>

        {/* Bottom Nav Ad Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid rgba(212, 197, 176, 0.3)'
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              إعلان القائمة السفلية
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0
            }}>
              إظهار أو إخفاء الإعلان في أسفل التطبيق (Bottom Navigation)
            </p>
          </div>

          <button
            onClick={() => handleToggle('showBottomNavAd')}
            style={{
              position: 'relative',
              width: '60px',
              height: '32px',
              background: settings.showBottomNavAd ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)' : '#E5E7EB',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '3px',
              right: settings.showBottomNavAd ? '3px' : '29px',
              width: '26px',
              height: '26px',
              background: '#FFFFFF',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>

        {/* My Ads Tab Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(212, 197, 176, 0.3)'
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              تبويب إعلاناتي
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: 0
            }}>
              إظهار أو إخفاء تبويب "إعلاناتي" في صفحة الملف الشخصي
            </p>
          </div>

          <button
            onClick={() => handleToggle('showMyAdsTab')}
            style={{
              position: 'relative',
              width: '60px',
              height: '32px',
              background: settings.showMyAdsTab ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)' : '#E5E7EB',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '3px',
              right: settings.showMyAdsTab ? '3px' : '29px',
              width: '26px',
              height: '26px',
              background: '#FFFFFF',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </button>
        </div>

        {/* Current Status */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(217, 209, 190, 0.15)',
          borderRadius: '12px',
          border: '1px solid rgba(217, 209, 190, 0.3)'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            الحالة الحالية:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: settings.showBottomNavAd ? '#10B981' : '#EF4444'
              }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                إعلان القائمة السفلية: {settings.showBottomNavAd ? 'ظاهر' : 'مخفي'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: settings.showMyAdsTab ? '#10B981' : '#EF4444'
              }} />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                تبويب إعلاناتي: {settings.showMyAdsTab ? 'ظاهر' : 'مخفي'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <GlassButton
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            padding: '14px 32px',
            fontSize: '16px',
            background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
            color: '#000',
            fontWeight: '600'
          }}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </GlassButton>
      </div>
    </>
  );

  const renderProfileTab = () => (
    <>
      {/* Admin Profile Section */}
      <GlassCard style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '24px'
        }}>
          معلومات الحساب
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <GlassInput
            label="اسم المستخدم"
            type="text"
            value={profileData.username}
            onChange={(value) => setProfileData({ ...profileData, username: value as string })}
            placeholder="أدخل اسم المستخدم"
            required
          />

          <GlassInput
            label="البريد الإلكتروني"
            type="email"
            value={profileData.email}
            onChange={(value) => setProfileData({ ...profileData, email: value as string })}
            placeholder="أدخل البريد الإلكتروني"
            required
          />

          <GlassInput
            label="الاسم الكامل"
            type="text"
            value={profileData.fullName}
            onChange={(value) => setProfileData({ ...profileData, fullName: value as string })}
            placeholder="أدخل الاسم الكامل"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <GlassButton
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
              color: '#000',
              fontWeight: '600'
            }}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </GlassButton>
        </div>
      </GlassCard>

      {/* Change Password Section */}
      <GlassCard>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '24px'
        }}>
          تغيير كلمة المرور
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <GlassInput
            label="كلمة المرور الحالية"
            type="password"
            value={passwordData.currentPassword}
            onChange={(value) => setPasswordData({ ...passwordData, currentPassword: value as string })}
            placeholder="أدخل كلمة المرور الحالية"
            required
          />

          <GlassInput
            label="كلمة المرور الجديدة"
            type="password"
            value={passwordData.newPassword}
            onChange={(value) => setPasswordData({ ...passwordData, newPassword: value as string })}
            placeholder="أدخل كلمة المرور الجديدة"
            required
          />

          <GlassInput
            label="تأكيد كلمة المرور الجديدة"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value as string })}
            placeholder="أعد إدخال كلمة المرور الجديدة"
            required
          />
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#1E40AF',
            margin: 0,
            lineHeight: '1.5'
          }}>
            📌 يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <GlassButton
            onClick={handleChangePassword}
            disabled={saving}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
              color: '#000',
              fontWeight: '600'
            }}
          >
            {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </GlassButton>
        </div>
      </GlassCard>
    </>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '24px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #D9D1BE',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
          margin: '0 0 16px 0'
        }}>
          الإعدادات
        </h1>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('app-control')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'app-control'
                ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                : 'rgba(255, 255, 255, 0.6)',
              color: '#000',
              backdropFilter: 'blur(10px)',
              boxShadow: activeTab === 'app-control'
                ? '0 4px 12px rgba(217, 209, 190, 0.3)'
                : 'none'
            }}
          >
            التحكم في التطبيق
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'profile'
                ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                : 'rgba(255, 255, 255, 0.6)',
              color: '#000',
              backdropFilter: 'blur(10px)',
              boxShadow: activeTab === 'profile'
                ? '0 4px 12px rgba(217, 209, 190, 0.3)'
                : 'none'
            }}
          >
            الملف الشخصي
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'app-control' && renderAppControlTab()}
      {activeTab === 'profile' && renderProfileTab()}
    </div>
  );
}
