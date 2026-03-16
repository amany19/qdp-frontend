'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface InstallmentWithDetails {
  bookingId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'card' | 'cash';
  paidAt?: string;
  paidAmount?: number;
  receiptUrl?: string;
  notes?: string;
  // Additional details populated from booking
  userId?: {
    _id: string;
    fullName: string;
    phone: string;
  };
  propertyId?: {
    _id: string;
    title: string;
    location: { area: string; city: string };
  };
}

export default function AdminInstallmentsPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [installments, setInstallments] = useState<InstallmentWithDetails[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<InstallmentWithDetails[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      fetchAllInstallments();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const onFocus = () => fetchAllInstallments();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [installments, statusFilter, searchQuery]);

  const fetchAllInstallments = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch approved and active rent bookings (same source as resident payment flow)
      const [resApproved, resActive] = await Promise.all([
        fetch(
          `${API_BASE_URL}/admin/properties/bookings/all?bookingType=rent&status=approved&limit=500`,
          { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
        ),
        fetch(
          `${API_BASE_URL}/admin/properties/bookings/all?bookingType=rent&status=active&limit=500`,
          { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
        ),
      ]);

      const toBookings = (res: Response) => {
        if (!res.ok) return [];
        return res.json().then((result: any) => {
          const data = result.data ?? result;
          return Array.isArray(data) ? data : [];
        });
      };

      const [bookingsApproved, bookingsActive] = await Promise.all([
        toBookings(resApproved),
        toBookings(resActive),
      ]);

      // Merge and dedupe by booking _id (in case backend returns same in both)
      const seen = new Set<string>();
      const bookings: any[] = [];
      for (const b of [...bookingsApproved, ...bookingsActive]) {
        const id = b._id?.toString?.() ?? b._id;
        if (id && !seen.has(id)) {
          seen.add(id);
          bookings.push(b);
        }
      }

      const allInstallments: InstallmentWithDetails[] = [];
      bookings.forEach((booking: any) => {
        if (booking.installments && booking.installments.length > 0) {
          booking.installments.forEach((inst: any) => {
            allInstallments.push({
              ...inst,
              bookingId: booking._id,
              userId: booking.userId,
              propertyId: booking.propertyId,
            });
          });
        }
      });

      setInstallments(allInstallments);
    } catch (error) {
      console.error('Error fetching installments:', error);
      setInstallments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...installments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.userId?.fullName?.toLowerCase().includes(query) ||
        i.propertyId?.title?.toLowerCase().includes(query) ||
        i.userId?.phone?.includes(query)
      );
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    setFilteredInstallments(filtered);
  };

  const handleMarkAsPaid = async (bookingId: string, installmentNumber: number, installmentAmount: number) => {
    const paymentMethod = confirm('الدفع بالبطاقة؟ (إلغاء = نقداً)') ? 'card' : 'cash';

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/properties/bookings/${bookingId}/installments/${installmentNumber}/mark-paid`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paidAmount: installmentAmount,
            paymentMethod,
            paidAt: new Date().toISOString()
          }),
        }
      );

      if (response.ok) {
        fetchAllInstallments(); // Refresh
      }
    } catch (error) {
      console.error('Error marking installment as paid:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    };

    const labels: Record<string, string> = {
      pending: 'في الانتظار',
      paid: 'مدفوع',
      overdue: 'متأخر',
      cancelled: 'ملغي',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const calculateStats = () => {
    const total = installments.length;
    const paid = installments.filter(i => i.status === 'paid').length;
    const pending = installments.filter(i => i.status === 'pending').length;
    const overdue = installments.filter(i => i.status === 'overdue' || isOverdue(i.dueDate, i.status)).length;
    const totalAmount = installments.reduce((sum, i) => sum + i.amount, 0);
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);

    return { total, paid, pending, overdue, totalAmount, paidAmount };
  };

  const stats = calculateStats();

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
            لوحة الأقساط الشهرية
          </h1>
          <p className="text-gray-600">
            إدارة جميع الأقساط الشهرية لعقود الإيجار. الحالة «مدفوع» تشمل الدفع من التطبيق ومن لوحة الإدارة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAllInstallments()}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'جاري التحديث...' : 'تحديث القائمة'}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: ds.colors.primary.black }}>
            {stats.total}
          </div>
          <div className="text-sm text-gray-600">إجمالي الأقساط</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {stats.paid}
          </div>
          <div className="text-sm text-gray-600">مدفوعة</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
          </div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-gray-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">في الانتظار</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-red-600">
            {stats.overdue}
          </div>
          <div className="text-sm text-gray-600">متأخرة</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-lg font-bold mb-1 text-blue-600">
            {stats.paidAmount.toLocaleString()} ر.ق
          </div>
          <div className="text-sm text-gray-600">المبلغ المحصل</div>
          <div className="text-xs text-gray-500 mt-1">
            من {stats.totalAmount.toLocaleString()} ر.ق
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={ds.components.glassCard} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">نسبة التحصيل الإجمالية</h3>
          <span className="text-2xl font-bold" style={{ color: ds.colors.primary.black }}>
            {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
            }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
          <span>{stats.paid} مدفوع</span>
          <span>{stats.pending} في الانتظار</span>
          <span className="text-red-600">{stats.overdue} متأخر</span>
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
              <option value="pending">في الانتظار</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
              <option value="cancelled">ملغية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div style={ds.components.glassCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>القسط</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المستأجر</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>تاريخ الاستحقاق</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المبلغ</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>طريقة الدفع</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>تاريخ الدفع</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    لا توجد أقساط
                  </td>
                </tr>
              ) : (
                filteredInstallments.map((installment, index) => {
                  const isInstOverdue = isOverdue(installment.dueDate, installment.status);
                  return (
                    <tr
                      key={`${installment.bookingId}-${installment.installmentNumber}`}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isInstOverdue ? 'bg-red-50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold">#{installment.installmentNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-sm">{installment.userId?.fullName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{installment.userId?.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium">{installment.propertyId?.title || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{installment.propertyId?.location?.area}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isInstOverdue ? 'text-red-600 font-semibold' : ''}`}>
                          {new Date(installment.dueDate).toLocaleDateString('ar-QA')}
                        </div>
                        {isInstOverdue && (
                          <div className="text-xs text-red-600">متأخر!</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{installment.amount.toLocaleString()} ر.ق</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(isInstOverdue ? 'overdue' : installment.status)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {installment.paymentMethod === 'card' ? 'بطاقة' :
                         installment.paymentMethod === 'cash' ? 'نقدي' : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {installment.paidAt ? new Date(installment.paidAt).toLocaleDateString('ar-QA') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/bookings/${installment.bookingId}`)}
                            className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                          >
                            الحجز
                          </button>
                          {(installment.status === 'pending' || isInstOverdue) && (
                            <button
                              onClick={() => handleMarkAsPaid(installment.bookingId, installment.installmentNumber, installment.amount)}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                              تحديد كمدفوع
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
