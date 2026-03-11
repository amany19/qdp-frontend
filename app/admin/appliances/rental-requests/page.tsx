'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassChip } from '../../components/ui/GlassChip';
import { adminAppliancesService, ApplianceRental } from '../../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function RentalRequestsPage() {
  const router = useRouter();
  const [rentalRequests, setRentalRequests] = useState<ApplianceRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRentalRequests();
  }, [activeTab]);

  const fetchRentalRequests = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (activeTab !== 'all') {
        filters.status = activeTab;
      }

      const data = await adminAppliancesService.getRentalRequests(filters);
      // Backend returns { requests, total, page, totalPages }
      setRentalRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      toast.error('فشل في تحميل طلبات التأجير');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B'; // Orange
      case 'approved':
        return '#10B981'; // Green
      case 'active':
        return '#3B82F6'; // Blue
      case 'completed':
        return '#6B7280'; // Gray
      case 'rejected':
        return '#EF4444'; // Red
      case 'cancelled':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const filteredRequests = rentalRequests.filter((request) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.applianceId?.nameAr?.toLowerCase().includes(query) ||
      request.applianceId?.nameEn?.toLowerCase().includes(query) ||
      request.userId?.fullName?.toLowerCase().includes(query)
    );
  });

  const getTabCount = (status: string) => {
    if (status === 'all') return rentalRequests.length;
    return rentalRequests.filter(r => r.status === status).length;
  };

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
          طلبات تأجير الأجهزة
        </h1>
        <GlassButton
          onClick={() => router.push('/admin/appliances')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: 'rgba(255, 255, 255, 0.6)',
            color: '#000'
          }}
        >
          ← جرد الأجهزة
        </GlassButton>
      </div>

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
          { key: 'pending', label: 'معلقة' },
          { key: 'approved', label: 'موافق عليها' },
          { key: 'active', label: 'جارية' },
          { key: 'completed', label: 'منتهية' },
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
              position: 'relative'
            }}
          >
            {tab.label}
            {tab.key !== 'all' && getTabCount(tab.key) > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                background: activeTab === tab.key ? '#000' : '#D9D1BE',
                color: activeTab === tab.key ? '#fff' : '#000',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {getTabCount(tab.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <GlassInput
          type="text"
          placeholder="بحث بالجهاز أو المستخدم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Rental Requests Table */}
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
        ) : filteredRequests.length === 0 ? (
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
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الأقساط</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المبلغ</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الحالة</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
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
                    <td style={{ padding: '16px', color: '#374151' }}>
                      {request.installments?.length || 0} قسط
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                      {request.totalAmount.toLocaleString()} ر.ق
                    </td>
                    <td style={{ padding: '16px' }}>
                      <GlassChip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
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
                          <GlassButton
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/appliances/rental-requests/${request._id}`);
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
