'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/config';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAdminAuthStore();

  const [countryCode, setCountryCode] = useState<string>('QA'); // Default to Qatar
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    setErrors((prev) => ({ ...prev, phone: undefined, general: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setErrors((prev) => ({ ...prev, phone: undefined, general: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
  };

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phoneNumber) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (phoneNumber.length < 8) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const callingCode = getCountryCallingCode(countryCode as any);
      const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhoneNumber,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الدخول');
      }

      if (data.user.userType !== 'admin' && data.user.userType !== 'super_admin') {
        throw new Error('الوصول مرفوض. يتطلب صلاحيات المسؤول.');
      }

      setAuth(data.accessToken, {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        userType: data.user.userType,
        adminPermissions: data.user.adminPermissions || {},
        profilePicture: data.user.profilePicture,
      });

      router.push('/admin/dashboard');
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrors({ general: err.message || 'حدث خطأ أثناء تسجيل الدخول' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.1); }
          20%, 40% { transform: scale(1); }
        }

        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        * {
          font-family: 'Tajawal', sans-serif;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 50%, #F9FAFB 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl',
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-5%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(217, 209, 190, 0.15), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-5%',
          left: '-5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(201, 193, 174, 0.12), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite',
          animationDelay: '2s',
        }} />

        {/* Login Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          animation: 'fadeInUp 0.7s ease-out',
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(217, 209, 190, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(217, 209, 190, 0.5)',
            padding: '50px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top Accent Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, transparent, #D9D1BE, transparent)',
            }} />

            {/* Logo & Title */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{
                width: '100px',
                height: '70px',
                margin: '0 auto 24px',
                position: 'relative',
                filter: 'drop-shadow(0 4px 16px rgba(217, 209, 190, 0.4))',
              }}>
                <Image
                  src="/logo.png"
                  alt="QDP"
                  width={100}
                  height={70}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 10px 0',
                letterSpacing: '-0.5px',
              }}>تسجيل الدخول</h1>
              <p style={{
                fontSize: '16px',
                color: '#6B7280',
                margin: 0,
                fontWeight: '600',
              }}>لوحة تحكم المسؤول - QDP</p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '26px',
                animation: 'fadeInUp 0.3s ease-out',
              }}>
                <p style={{
                  color: '#DC2626',
                  fontSize: '14px',
                  margin: 0,
                  textAlign: 'center',
                  fontWeight: '600',
                }}>{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Phone Input */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '10px',
                }}>رقم الهاتف</label>
                <div style={{ direction: 'ltr', display: 'flex', gap: '8px' }}>
                  {/* Country Code Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    style={{
                      padding: '16px 12px',
                      background: '#F9F9F9',
                      border: errors.phone ? '2px solid #EF4444' : '2px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      minWidth: '120px',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.border = '2px solid #D9D1BE';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(217, 209, 190, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = '#F9F9F9';
                      e.currentTarget.style.border = errors.phone ? '2px solid #EF4444' : '2px solid #E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {getCountries().map((country) => {
                      const callingCode = getCountryCallingCode(country);
                      const countryName = en[country] || country;
                      return (
                        <option key={country} value={country}>
                          {countryName} (+{callingCode})
                        </option>
                      );
                    })}
                  </select>

                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    placeholder="أدخل رقم الهاتف"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      background: '#F9F9F9',
                      border: errors.phone ? '2px solid #EF4444' : '2px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#111827',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      textAlign: 'right',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.border = '2px solid #D9D1BE';
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(217, 209, 190, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = '#F9F9F9';
                      e.currentTarget.style.border = errors.phone ? '2px solid #EF4444' : '2px solid #E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.phone && (
                  <p style={{
                    fontSize: '13px',
                    color: '#DC2626',
                    margin: '8px 0 0 0',
                    fontWeight: '600',
                  }}>{errors.phone}</p>
                )}
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '10px',
                }}>كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: '#F9F9F9',
                    border: errors.password ? '2px solid #EF4444' : '2px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    fontWeight: '500',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.border = '2px solid #D9D1BE';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(217, 209, 190, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F9F9F9';
                    e.currentTarget.style.border = errors.password ? '2px solid #EF4444' : '2px solid #E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {errors.password && (
                  <p style={{
                    fontSize: '13px',
                    color: '#DC2626',
                    margin: '8px 0 0 0',
                    fontWeight: '600',
                  }}>{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: loading ? '#E5E7EB' : '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: loading ? '#9CA3AF' : '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = loading ? '#E5E7EB' : '#000000';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)';
                }}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                margin: '0 0 8px 0',
                fontWeight: '600',
              }}>
                جميع الحقوق محفوظة © QDP 2025
              </p>
              <p style={{
                fontSize: '12px',
                color: '#9CA3AF',
                margin: 0,
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <span>طُوِّر بواسطة</span>
                <a
                  href="https://www.qeematech.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'relative',
                    textDecoration: 'none',
                    fontWeight: '700',
                    background: 'linear-gradient(90deg, #8B7355 0%, #D9D1BE 50%, #8B7355 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shine 3s linear infinite',
                  }}
                >
                  قيمة تك
                </a>
                <span>مع</span>
                <span style={{
                  color: '#EF4444',
                  fontSize: '14px',
                  display: 'inline-block',
                  animation: 'heartbeat 1.5s ease-in-out infinite',
                }}>❤</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
