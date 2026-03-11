'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface TransferRequest {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  currentPropertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
  };
  requestedPropertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  eligibilityCheck: {
    similarUnitAvailable: boolean;
    noLatePayments: boolean;
    allInstallmentsPaid: boolean;
    message?: string;
  };
  paymentHistory: Array<{
    month: string;
    status: 'on_time' | 'late' | 'missed';
    daysLate?: number;
  }>;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

export default function AdminTransfersPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdFilter = searchParams.get('propertyId');

  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<TransferRequest[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      fetchTransfers();
    }
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [transfers, statusFilter, searchQuery]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const url = propertyIdFilter
        ? `${API_BASE_URL}/admin/properties/transfers/all?propertyId=${propertyIdFilter}`
        : `${API_BASE_URL}/admin/properties/transfers/all`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend may return {data: [...], pagination: {...}} or flat array
        const data = result.data || result;
        // Ensure data is an array
        setTransfers(Array.isArray(data) ? data : []);
      } else {
        setTransfers([]);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transfers];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.userId?.fullName?.toLowerCase().includes(query) ||
        t.currentPropertyId?.title?.toLowerCase().includes(query) ||
        t.requestedPropertyId?.title?.toLowerCase().includes(query) ||
        t.userId?.phone?.includes(query)
      );
    }

    setFilteredTransfers(filtered);
  };

  const handleApprove = async (transferId: string) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/transfers/${transferId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('تم الموافقة على الطلب بنجاح');
        fetchTransfers(); // Refresh list
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message || 'فشل في الموافقة'}`);
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      alert('حدث خطأ أثناء الموافقة على الطلب');
    }
  };

  const handleReject = async (transferId: string) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/transfers/${transferId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('تم رفض الطلب بنجاح');
        fetchTransfers(); // Refresh list
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message || 'فشل في الرفض'}`);
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getEligibilityBadge = (eligibilityCheck: TransferRequest['eligibilityCheck']) => {
    if (!eligibilityCheck) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          قيد المراجعة
        </span>
      );
    }

    const allMet = eligibilityCheck.similarUnitAvailable &&
                    eligibilityCheck.noLatePayments &&
                    eligibilityCheck.allInstallmentsPaid;

    if (allMet) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          مؤهل
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          غير مؤهل
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
          طلبات نقل العقارات
        </h1>
        <p className="text-gray-600">إدارة طلبات نقل المستأجرين بين العقارات</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: ds.colors.primary.black }}>
            {transfers.length}
          </div>
          <div className="text-sm text-gray-600">إجمالي الطلبات</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-yellow-600">
            {transfers.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">قيد المراجعة</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {transfers.filter(t => t.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">موافق عليها</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-red-600">
            {transfers.filter(t => t.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">مرفوضة</div>
        </div>
      </div>

      {/* Filters */}
      <div style={ds.components.glassCard} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              بحث
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اسم المستخدم أو العقار..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">موافق عليها</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div style={ds.components.glassCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المستخدم</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار الحالي</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار المطلوب</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الأهلية</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>التاريخ</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد طلبات نقل
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-sm">{transfer.userId?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{transfer.userId?.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        {transfer.currentPropertyId ? (
                          <>
                            <div className="text-sm font-medium">{transfer.currentPropertyId.title}</div>
                            <div className="text-xs text-gray-500">
                              {transfer.currentPropertyId.location?.area}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            العقار محذوف
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        {transfer.requestedPropertyId ? (
                          <>
                            <div className="text-sm font-medium">{transfer.requestedPropertyId.title}</div>
                            <div className="text-xs text-gray-500">
                              {transfer.requestedPropertyId.location?.area}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            العقار محذوف
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getEligibilityBadge(transfer.eligibilityCheck)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{new Date(transfer.createdAt).toLocaleDateString('ar-QA')}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/transfers/${transfer._id}`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          عرض
                        </button>
                        {transfer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transfer._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleReject(transfer._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
