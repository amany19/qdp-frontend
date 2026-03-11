'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassChip } from '../components/ui/GlassChip';
import { adminAppliancesService, Appliance, ApplianceRental } from '../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function AppliancesPage() {
  const router = useRouter();
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [rentalRequests, setRentalRequests] = useState<ApplianceRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'rented' | 'maintenance' | 'rental-requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'rental-requests') {
      fetchRentalRequests();
    } else {
      fetchAppliances();
    }
    fetchStats();
  }, [activeTab, typeFilter]);

  const fetchAppliances = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (activeTab !== 'all') {
        filters.status = activeTab;
      }

      if (typeFilter !== 'all') {
        filters.applianceType = typeFilter;
      }

      const data = await adminAppliancesService.getAllAppliances(filters);
      // Backend returns { appliances, total, page, totalPages }
      setAppliances(data.appliances || []);
    } catch (error) {
      console.error('Error fetching appliances:', error);
      toast.error('فشل في تحميل الأجهزة');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminAppliancesService.getAppliancesStats();
      setStats({
        total: data.totalAppliances || 0,
        available: data.available || 0,
        rented: data.rented || 0,
        maintenance: data.maintenance || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      setLoading(true);
      const data = await adminAppliancesService.getRentalRequests({});
      setRentalRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      toast.error('فشل في تحميل طلبات التأجير');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRental = async (requestId: string) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
      return;
    }

    try {
      await adminAppliancesService.approveRental(requestId, {});
      toast.success('تم الموافقة على الطلب بنجاح');
      fetchRentalRequests();
      fetchStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error approving rental:', error);
      toast.error(err.response?.data?.message || 'فشل في الموافقة على الطلب');
    }
  };

  const handleRejectRental = async (requestId: string) => {
    const reason = prompt('يرجى إدخال سبب الرفض:');
    if (!reason) return;

    try {
      await adminAppliancesService.rejectRental(requestId, { rejectionReason: reason });
      toast.success('تم رفض الطلب');
      fetchRentalRequests();
      fetchStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error rejecting rental:', error);
      toast.error(err.response?.data?.message || 'فشل في رفض الطلب');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10B981'; // Green
      case 'rented':
        return '#3B82F6'; // Blue
      case 'maintenance':
        return '#F59E0B'; // Orange
      case 'inactive':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'rented':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      case 'inactive':
        return 'غير نشط';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      refrigerator: 'ثلاجة',
      tv: 'تلفاز',
      washing_machine: 'غسالة',
      ac: 'مكيف',
      oven: 'فرن',
      microwave: 'ميكرويف',
      dishwasher: 'غسالة صحون',
    };
    return types[type] || type;
  };

  const getRentalStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'active':
        return '#3B82F6';
      case 'completed':
        return '#6B7280';
      case 'rejected':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getRentalStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'approved':
        return 'موافق عليه';
      case 'active':
        return 'جاري';
      case 'completed':
        return 'منتهي';
      case 'rejected':
        return 'مرفوض';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const filteredAppliances = appliances.filter((appliance) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      appliance.nameAr.toLowerCase().includes(query) ||
      appliance.nameEn.toLowerCase().includes(query) ||
      appliance.brand.toLowerCase().includes(query)
    );
  });

  const filteredRentalRequests = rentalRequests.filter((request) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.applianceId?.nameAr?.toLowerCase().includes(query) ||
      request.applianceId?.nameEn?.toLowerCase().includes(query) ||
      request.userId?.fullName?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0
        }}>
          جرد الأجهزة
        </h1>
        <GlassButton
          onClick={() => router.push('/admin/appliances/create')}
          style={{
            background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
            color: '#000',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          + إضافة جهاز جديد
        </GlassButton>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {stats.total || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                إجمالي الأجهزة
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#10B981',
                marginBottom: '8px'
              }}>
                {stats.available || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                متاح
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#3B82F6',
                marginBottom: '8px'
              }}>
                {stats.rented || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                مؤجر حالياً
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#F59E0B',
                marginBottom: '8px'
              }}>
                {stats.maintenance || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                في الصيانة
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        paddingBottom: '12px'
      }}>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'available', label: 'متاح' },
          { key: 'rented', label: 'مؤجر' },
          { key: 'maintenance', label: 'صيانة' },
          { key: 'rental-requests', label: 'طلبات الايجار' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                : 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: activeTab === tab.key ? '#000' : '#6B7280',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center'
      }}>
        <GlassInput
          type="text"
          placeholder="بحث بالاسم أو الماركة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, maxWidth: '400px' }}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 197, 176, 0.4)',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#111827',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="all">جميع الأنواع</option>
          <option value="refrigerator">ثلاجة</option>
          <option value="tv">تلفاز</option>
          <option value="washing_machine">غسالة</option>
          <option value="ac">مكيف</option>
          <option value="oven">فرن</option>
          <option value="microwave">ميكرويف</option>
          <option value="dishwasher">غسالة صحون</option>
        </select>
      </div>

      {/* Content Based on Active Tab */}
      <GlassCard>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #E5E7EB',
              borderTop: '3px solid #D9D1BE',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        ) : activeTab === 'rental-requests' ? (
          // Rental Requests Table
          filteredRentalRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
              لا توجد طلبات تأجير
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الجهاز</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المستخدم</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المدة</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المبلغ</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الحالة</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentalRequests.map((request) => (
                    <tr
                      key={request._id}
                      style={{
                        borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(217, 209, 190, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {request.applianceId?.images?.[0] && (
                            <img
                              src={request.applianceId?.images?.[0]}
                              alt={request.applianceId.nameAr}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                              {request.applianceId?.nameAr || 'غير معروف'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280' }}>
                              {request.applianceId?.brand} {request.applianceId?.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {request.userId?.fullName || 'غير معروف'}
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {request.durationMonths} شهر
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                        {request.totalAmount.toLocaleString()} ر.ق
                      </td>
                      <td style={{ padding: '16px' }}>
                        <GlassChip
                          label={getRentalStatusLabel(request.status)}
                          color={getRentalStatusColor(request.status)}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <GlassButton
                            onClick={() => router.push(`/admin/appliances/rental-requests/${request._id}`)}
                            style={{
                              padding: '8px 16px',
                              fontSize: '14px',
                              background: 'rgba(217, 209, 190, 0.2)',
                              color: '#000'
                            }}
                          >
                            عرض
                          </GlassButton>
                          {request.status === 'pending' && (
                            <>
                              <GlassButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveRental(request._id);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  color: '#fff'
                                }}
                              >
                                موافقة
                              </GlassButton>
                              <GlassButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectRental(request._id);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '14px',
                                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                  color: '#fff'
                                }}
                              >
                                رفض
                              </GlassButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Appliances Table
          filteredAppliances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
              لا توجد أجهزة
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الصورة</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الاسم</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>النوع</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>السعر/شهر</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الحالة</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>آخر تأجير</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map((appliance) => (
                    <tr
                      key={appliance._id}
                      style={{
                        borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(217, 209, 190, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <img
                          src={appliance.images?.[0] || '/images/placeholder.png'}
                          alt={appliance.nameAr}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                          {appliance.nameAr}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6B7280' }}>
                          {appliance.brand} {appliance.model}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <GlassChip
                          label={getTypeLabel(appliance.applianceType)}
                          color="#6B7280"
                        />
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                        {appliance.monthlyPrice} ر.ق
                      </td>
                      <td style={{ padding: '16px' }}>
                        <GlassChip
                          label={getStatusLabel(appliance.status)}
                          color={getStatusColor(appliance.status)}
                        />
                      </td>
                      <td style={{ padding: '16px', color: '#6B7280' }}>
                        {appliance.lastRentalDate
                          ? new Date(appliance.lastRentalDate).toLocaleDateString('ar-QA')
                          : '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <GlassButton
                          onClick={() => router.push(`/admin/appliances/${appliance._id}`)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            background: 'rgba(217, 209, 190, 0.2)',
                            color: '#000'
                          }}
                        >
                          عرض
                        </GlassButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </GlassCard>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
