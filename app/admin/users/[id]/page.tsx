'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { adminUsersService, User, UserStats } from '../../services/adminUsersService';

const userTypeLabels: Record<string, string> = {
  resident: 'ساكن',
  user: 'عارض',
  admin: 'مسؤول',
  super_admin: 'مسؤول رئيسي',
};

interface Activity {
  type: 'property' | 'appointment' | 'contract';
  action: string;
  description: string;
  status: string;
  date: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const [userData, statsData] = await Promise.all([
        adminUsersService.getUser(userId),
        adminUsersService.getUserStats(userId),
      ]);
      setUser(userData);
      setStats(statsData.stats);

      // Load activity in background
      loadActivity();
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      setActivityLoading(true);
      const activityData = await adminUsersService.getUserActivity(userId, 20);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ color: '#6B7280', fontSize: '16px' }}>جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#111827' }}>المستخدم غير موجود</h2>
        <GlassButton onClick={() => router.push('/admin/users')}>العودة للمستخدمين</GlassButton>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'Tajawal, sans-serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <GlassButton variant="secondary" onClick={() => router.push('/admin/users')}>
            ← العودة
          </GlassButton>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {user.fullName}
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 700,
                marginBottom: '16px',
              }}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>{user.fullName}</h2>
              <p style={{ color: '#6B7280', margin: '4px 0' }}>{userTypeLabels[user.userType]}</p>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '4px 0' }}>
                انضم {new Date(user.createdAt).toLocaleDateString('ar-QA', { year: 'numeric', month: 'long' })}
              </p>
              <div style={{ marginTop: '16px' }}>
                {user.phoneVerified ? (
                  <span style={{
                    padding: '6px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#059669',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    ✓ موثق
                  </span>
                ) : (
                  <span style={{
                    padding: '6px 16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#D97706',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    ⚠ غير موثق
                  </span>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          {stats && (
            <GlassCard>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 24px 0' }}>إحصائيات سريعة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217, 209, 190, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {stats.properties}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>العقارات</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217, 209, 190, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {stats.appointments}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>المواعيد</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217, 209, 190, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {stats.contracts}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>العقود</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(217, 209, 190, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                      {stats.totalSpent.toLocaleString()} ر.ق
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>الإجمالي</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Main Content */}
        <GlassCard>
          <div style={{ padding: '24px' }}>
            {/* Personal Information */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>المعلومات الشخصية</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>الاسم الكامل:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{user.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>رقم الهوية:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{user.identityNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>الهاتف:</div>
                  <div style={{ fontSize: '14px', color: '#111827', direction: 'ltr', textAlign: 'right' }}>{user.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>البريد الإلكتروني:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{user.email || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>الجنس:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {user.gender === 'male' ? 'ذكر' : user.gender === 'female' ? 'أنثى' : 'آخر'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>اللغة:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {user.languagePreference === 'ar' ? 'العربية' : 'English'}
                  </div>
                </div>
                {user.address && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>العنوان:</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{user.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>معلومات الحساب</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>نوع الحساب:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{userTypeLabels[user.userType]}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>تاريخ الإنشاء:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {new Date(user.createdAt).toLocaleDateString('ar-QA')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>التحقق من الهاتف:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {user.phoneVerified ? '✓ موثق' : '✗ غير موثق'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '4px' }}>التحقق من البريد:</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {user.emailVerified ? '✓ موثق' : '✗ غير موثق'}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>آخر الأنشطة</h3>

              {activityLoading ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                  جاري تحميل الأنشطة...
                </div>
              ) : activity.length === 0 ? (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  background: 'rgba(217, 209, 190, 0.1)',
                  borderRadius: '12px',
                  color: '#6B7280',
                }}>
                  لا توجد أنشطة حتى الآن
                </div>
              ) : (
                <div style={{ position: 'relative', paddingRight: '40px' }}>
                  {/* Timeline Line */}
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(217, 209, 190, 0.3) 0%, rgba(217, 209, 190, 0.1) 100%)',
                  }} />

                  {activity.map((item, index) => {
                    const activityIcon = item.type === 'property' ? '🏢' : item.type === 'appointment' ? '📅' : '📄';
                    const activityColor =
                      item.type === 'property' ? '#3B82F6' :
                      item.type === 'appointment' ? '#8B5CF6' :
                      '#10B981';

                    return (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          marginBottom: index === activity.length - 1 ? 0 : '24px',
                          paddingRight: '24px',
                        }}
                      >
                        {/* Timeline Dot */}
                        <div style={{
                          position: 'absolute',
                          right: '8px',
                          top: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: activityColor,
                          border: '3px solid rgba(255, 255, 255, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          zIndex: 1,
                        }}>
                          {activityIcon}
                        </div>

                        {/* Activity Card */}
                        <div style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.4)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(212, 197, 176, 0.2)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                          e.currentTarget.style.transform = 'translateX(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                {item.action}
                              </div>
                              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                {item.description}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 12px',
                              background:
                                item.status === 'active' || item.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' :
                                item.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                                item.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                                'rgba(107, 114, 128, 0.1)',
                              color:
                                item.status === 'active' || item.status === 'completed' ? '#059669' :
                                item.status === 'pending' ? '#D97706' :
                                item.status === 'cancelled' ? '#DC2626' :
                                '#6B7280',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>
                              {item.status === 'active' ? 'نشط' :
                               item.status === 'completed' ? 'مكتمل' :
                               item.status === 'pending' ? 'قيد الانتظار' :
                               item.status === 'cancelled' ? 'ملغي' :
                               item.status}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🕒</span>
                            <span>{new Date(item.date).toLocaleDateString('ar-QA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
