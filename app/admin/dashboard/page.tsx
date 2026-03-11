'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeProperties: number;
    pendingAppointments: number;
    revenueThisMonth: number;
    newUsersThisWeek: number;
    totalContracts: number;
    activeContracts: number;
    totalPayments: number;
  };
  charts: {
    propertiesByLocation: Array<{ location: string; count: number }>;
    revenueByMonth: Array<any>;
  };
  appointmentsToday: Array<any>;
}

interface RecentActivity {
  type: string;
  icon: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

export default function DashboardPage() {
  const { token } = useAdminAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await fetch(`${API_BASE_URL}/admin/analytics/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        let statsData: any = null;
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
        }

        // Fetch pending appointments count (unconfirmed inspection appointments)
        const pendingAppointmentsResponse = await fetch(`${API_BASE_URL}/admin/appointments?status=unconfirmed&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (pendingAppointmentsResponse.ok) {
          const pendingData = await pendingAppointmentsResponse.json();
          if (statsData && statsData.overview) {
            statsData.overview.pendingAppointments = pendingData.pagination?.total || 0;
          }
        }

        // Fetch today's confirmed appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todayAppointmentsResponse = await fetch(`${API_BASE_URL}/admin/appointments?status=confirmed&limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (todayAppointmentsResponse.ok) {
          const todayData = await todayAppointmentsResponse.json();
          // Filter appointments that are today - extract date from ISO string to avoid timezone issues
          const todayAppointments = (todayData.appointments || []).filter((apt: any) => {
            if (!apt.date) return false;
            // Extract date part from ISO string (YYYY-MM-DD)
            const aptDateStr = typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0];
            return aptDateStr === todayStr;
          });

          if (statsData) {
            statsData.appointmentsToday = todayAppointments;
          }
        }

        if (statsData) {
          setStats(statsData);
        }

        // Fetch recent activities
        const activitiesResponse = await fetch(`${API_BASE_URL}/admin/analytics/recent-activity?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setRecentActivities(activitiesData);
        }
      } catch (error) {
        // Error fetching dashboard data
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-QA', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  // Skeleton loading component
  const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '8px' }: any) => (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
  );

  const statsCards = [
    {
      titleAr: 'إجمالي المستخدمين',
      value: loading || !stats ? '...' : stats.overview.totalUsers.toLocaleString('ar'),
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      trend: loading || !stats ? '' : `+${stats.overview.newUsersThisWeek}`,
      positive: true,
      subtitle: 'مستخدم جديد هذا الأسبوع',
    },
    {
      titleAr: 'العقارات النشطة',
      value: loading || !stats ? '...' : stats.overview.activeProperties.toLocaleString('ar'),
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      trend: loading || !stats ? '' : `${stats.overview.totalContracts}`,
      positive: true,
      subtitle: 'عقد نشط',
    },
    {
      titleAr: 'المواعيد المعلقة',
      value: loading || !stats ? '...' : stats.overview.pendingAppointments.toLocaleString('ar'),
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      trend: '',
      positive: false,
      subtitle: 'بانتظار التأكيد',
    },
    {
      titleAr: 'الإيرادات هذا الشهر',
      value: loading || !stats ? '...' : formatCurrency(stats.overview.revenueThisMonth),
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: loading || !stats ? '' : `${stats.overview.totalPayments}`,
      positive: true,
      subtitle: 'دفعة مكتملة',
    },
  ];

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        {/* Page Header */}
      <div style={{
        marginBottom: '8px',
        direction: 'rtl',
        textAlign: 'right',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px',
        }}>لوحة التحكم</h1>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          margin: 0,
          fontWeight: 500,
        }}>نظرة عامة على الإحصائيات</p>
      </div>

      {/* Stats Grid - Fixed to show all 4 cards in one row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
      }}>
        {loading ? (
          // Skeleton loading for stats cards
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                padding: '24px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  flex: 1,
                  textAlign: 'right',
                  direction: 'rtl',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <SkeletonBox width="60%" height="14px" />
                  <SkeletonBox width="80%" height="32px" />
                  <SkeletonBox width="50%" height="13px" />
                </div>
                <SkeletonBox width="60px" height="60px" borderRadius="50%" />
              </div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(229, 231, 235, 0.5)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                padding: '24px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  flex: 1,
                  textAlign: 'right',
                  direction: 'rtl',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    marginBottom: '8px',
                    fontWeight: 600,
                    textAlign: 'right',
                  }}>{stat.titleAr}</p>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#111827',
                    marginBottom: '12px',
                    textAlign: 'right',
                  }}>{stat.value}</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'flex-end',
                  }}>
                    {stat.trend && (
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: stat.positive ? '#10B981' : '#EF4444',
                      }}>
                        {stat.trend}
                      </span>
                    )}
                    <span style={{
                      fontSize: '13px',
                      color: '#9CA3AF',
                      fontWeight: 500,
                    }}>{stat.subtitle}</span>
                  </div>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  flexShrink: 0,
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* First Row: Activities and Revenue Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        {/* Recent Activities */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '20px',
            textAlign: 'right',
          }}>النشاطات الأخيرة</h3>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '8px',
                  borderRight: '3px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <SkeletonBox width="70%" height="14px" />
                  <SkeletonBox width="40%" height="12px" />
                </div>
              ))}
            </div>
          ) : recentActivities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '8px',
                  borderRight: '3px solid #D9D1BE',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    textAlign: 'right',
                  }}>{activity.message}</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    margin: 0,
                    textAlign: 'right',
                  }}>{formatRelativeTime(activity.timestamp)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6B7280' }}>لا توجد نشاطات حديثة</p>
          )}
        </div>

        {/* Revenue Chart */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '20px',
            textAlign: 'right',
          }}>الإيرادات الشهرية</h3>

          {loading ? (
            <div style={{
              height: '280px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              gap: '12px',
              padding: '20px 10px',
            }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <SkeletonBox width="40px" height="14px" />
                  <SkeletonBox
                    width="100%"
                    height={`${Math.random() * 60 + 40}%`}
                    borderRadius="8px 8px 0 0"
                  />
                  <SkeletonBox width="50px" height="12px" />
                </div>
              ))}
            </div>
          ) : stats?.charts.revenueByMonth && stats.charts.revenueByMonth.length > 0 ? (
            <div style={{
              height: '280px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              gap: '12px',
              padding: '20px 10px',
              borderBottom: '2px solid #E5E7EB',
              position: 'relative',
            }}>
              {/* Y-axis grid lines */}
              {[100, 75, 50, 25].map((val) => (
                <div
                  key={val}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${val}%`,
                    height: '1px',
                    background: '#F3F4F6',
                    zIndex: 0,
                  }}
                />
              ))}

              {stats.charts.revenueByMonth.map((month, index) => {
                const maxRevenue = Math.max(...stats.charts.revenueByMonth.map(m => m.total));
                const heightPercentage = (month.total / maxRevenue) * 100;

                // Format amount for display
                const formatAmount = (amount: number) => {
                  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
                  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
                  return amount.toString();
                };

                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {/* Value label on top */}
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#10B981',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                    }}>
                      {formatAmount(month.total)}
                    </div>

                    {/* Bar */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '60px',
                        height: `${Math.max(heightPercentage, 5)}%`,
                        background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                        borderRadius: '8px 8px 0 0',
                        boxShadow: '0 -2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.05)';
                        e.currentTarget.style.boxShadow = '0 -4px 16px rgba(16, 185, 129, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1)';
                        e.currentTarget.style.boxShadow = '0 -2px 8px rgba(16, 185, 129, 0.3)';
                      }}
                      title={`${formatCurrency(month.total)} - ${month.count} دفعة`}
                    />

                    {/* Month label */}
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6B7280',
                      textAlign: 'center',
                      marginTop: '8px',
                      whiteSpace: 'nowrap',
                    }}>
                      {month.monthName}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '50px 0' }}>لا توجد بيانات إيرادات</p>
          )}
        </div>
      </div>

      {/* Second Row: Today's Appointments and Properties by Location */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        {/* Today's Appointments */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '20px',
            textAlign: 'right',
          }}>المواعيد اليوم</h3>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '8px',
                  borderRight: '3px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <SkeletonBox width="80%" height="14px" />
                  <SkeletonBox width="60%" height="13px" />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <SkeletonBox width="60px" height="24px" borderRadius="4px" />
                    <SkeletonBox width="80px" height="12px" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.appointmentsToday && stats.appointmentsToday.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.appointmentsToday.slice(0, 5).map((appointment: any, index: number) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '8px',
                  borderRight: '3px solid #10B981',
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    textAlign: 'right',
                  }}>{appointment.propertyId?.title || 'عقار'}</p>
                  <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    margin: '0 0 4px 0',
                    textAlign: 'right',
                  }}>العميل: {appointment.userId?.fullName || 'غير محدد'}</p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      background: appointment.appointmentType === 'viewing' ? '#FEF3C7' : '#DBEAFE',
                      color: appointment.appointmentType === 'viewing' ? '#92400E' : '#1E40AF',
                      borderRadius: '4px',
                    }}>
                      {appointment.appointmentType === 'viewing' ? 'معاينة' : 'تسليم'}
                    </span>
                    <p style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      margin: 0,
                    }}>{new Date(appointment.date).toLocaleDateString('ar-QA')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6B7280' }}>لا توجد مواعيد اليوم</p>
          )}
        </div>

        {/* Properties by Location Chart */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
          padding: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '20px',
            textAlign: 'right',
          }}>العقارات حسب الموقع</h3>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <SkeletonBox width="35%" height="14px" />
                    <SkeletonBox width="25%" height="14px" />
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#E5E7EB',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}>
                    <SkeletonBox
                      width={`${Math.random() * 50 + 30}%`}
                      height="100%"
                      borderRadius="999px"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.charts.propertiesByLocation && stats.charts.propertiesByLocation.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stats.charts.propertiesByLocation.map((location, index) => {
                const total = stats.charts.propertiesByLocation.reduce((sum, item) => sum + item.count, 0);
                const percentage = ((location.count / total) * 100).toFixed(1);

                return (
                  <div key={index}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        textAlign: 'right',
                      }}>{location.location}</span>
                      <span style={{
                        fontSize: '14px',
                        color: '#6B7280',
                      }}>
                        {location.count} ({percentage}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#E5E7EB',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #D9D1BE 0%, #C9C1AE 100%)',
                        transition: 'width 0.3s ease',
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '50px 0' }}>لا توجد بيانات</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
