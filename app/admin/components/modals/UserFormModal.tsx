'use client';

import React, { useState } from 'react';
import { GlassModal } from '../ui/GlassModal';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { User } from '../../services/adminUsersService';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    identityNumber: user?.identityNumber || '',
    phone: user?.phone || '',
    email: user?.email || '',
    password: '',
    userType: user?.userType || 'user',
    gender: user?.gender || 'male',
    address: user?.address || '',
    languagePreference: user?.languagePreference || 'ar',
  });

  // Update form data when user prop changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        identityNumber: user.identityNumber || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        userType: user.userType || 'user',
        gender: user.gender || 'male',
        address: user.address || '',
        languagePreference: user.languagePreference || 'ar',
      });
    } else {
      // Reset form for create mode
      setFormData({
        fullName: '',
        identityNumber: '',
        phone: '',
        email: '',
        password: '',
        userType: 'user',
        gender: 'male',
        address: '',
        languagePreference: 'ar',
      });
    }
    // Clear errors when user changes
    setErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.identityNumber.trim()) {
      newErrors.identityNumber = 'رقم الهوية مطلوب';
    } else if (formData.identityNumber.length !== 11) {
      newErrors.identityNumber = 'رقم الهوية يجب أن يكون 11 رقم';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!formData.phone.startsWith('+974')) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ +974';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitData: any = { ...formData };

      // Remove password if empty (for edit mode)
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Failed to submit user:', error);
      setErrors({ submit: err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'}
      size="lg"
      footer={
        <>
          <GlassButton variant="secondary" onClick={onClose} disabled={loading}>
            إلغاء
          </GlassButton>
          <GlassButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'جاري الحفظ...' : mode === 'create' ? 'إضافة المستخدم' : 'حفظ التعديلات'}
          </GlassButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {errors.submit && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#DC2626',
              fontSize: '14px',
              textAlign: 'right',
            }}
          >
            {errors.submit}
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
            المعلومات الشخصية
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <GlassInput
              label="الاسم الكامل"
              value={formData.fullName}
              onChange={(value) => handleChange('fullName', value)}
              placeholder="أدخل الاسم الكامل"
              required
              error={errors.fullName}
            />

            <GlassInput
              label="رقم الهوية"
              value={formData.identityNumber}
              onChange={(value) => handleChange('identityNumber', value)}
              placeholder="28012345678"
              required
              error={errors.identityNumber}
              maxLength={11}
            />

            <GlassInput
              label="رقم الهاتف"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              placeholder="+97412345678"
              required
              error={errors.phone}
              dir="ltr"
            />

            <GlassInput
              label="البريد الإلكتروني"
              type="email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              placeholder="example@email.com"
              error={errors.email}
              dir="ltr"
            />

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  textAlign: 'right',
                }}
              >
                الجنس
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif',
                  direction: 'rtl',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
                <option value="other">آخر</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  textAlign: 'right',
                }}
              >
                اللغة المفضلة
              </label>
              <select
                value={formData.languagePreference}
                onChange={(e) => handleChange('languagePreference', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif',
                  direction: 'rtl',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <GlassInput
              label="العنوان"
              value={formData.address}
              onChange={(value) => handleChange('address', value)}
              placeholder="أدخل العنوان (اختياري)"
            />
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
            معلومات الحساب
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  textAlign: 'right',
                }}
              >
                نوع الحساب <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={formData.userType}
                onChange={(e) => handleChange('userType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif',
                  direction: 'rtl',
                  boxSizing: 'border-box' as const,
                }}
              >
                <option value="resident">ساكن</option>
                <option value="user">عارض</option>
                <option value="admin">مسؤول</option>
                <option value="super_admin">مسؤول رئيسي</option>
              </select>
            </div>

            <GlassInput
              label={mode === 'create' ? 'كلمة المرور' : 'كلمة المرور الجديدة (اختياري)'}
              type="password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              placeholder="أدخل كلمة المرور"
              required={mode === 'create'}
              error={errors.password}
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </GlassModal>
  );
};
