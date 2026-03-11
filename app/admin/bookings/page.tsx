'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Booking {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
  };
  bookingType: 'rent' | 'sale';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalAmount: number;
  monthlyAmount?: number;
  numberOfInstallments?: number;
  startDate?: string;
  endDate?: string;
  installments?: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  }>;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdFilter = searchParams.get('propertyId');

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, typeFilter, searchQuery]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = propertyIdFilter
        ? `${API_BASE_URL}/admin/properties/bookings/all?propertyId=${propertyIdFilter}`
        : `${API_BASE_URL}/admin/properties/bookings/all`;

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
        setBookings(Array.isArray(data) ? data : []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(b => b.bookingType === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.userId?.fullName?.toLowerCase().includes(query) ||
        b.propertyId?.title?.toLowerCase().includes(query) ||
        b.userId?.phone?.includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleApprove = async (bookingId: string) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الحجز؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/bookings/${bookingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchBookings(); // Refresh list
      }
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/bookings/${bookingId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh list
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      cancelled: 'ملغي',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type === 'rent') {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
          إيجار
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
          بيع
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
          طلبات الحجز
        </h1>
        <p className="text-gray-600">إدارة جميع طلبات حجز العقارات</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: ds.colors.primary.black }}>
            {bookings.length}
          </div>
          <div className="text-sm text-gray-600">إجمالي الطلبات</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">قيد المراجعة</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {bookings.filter(b => b.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">موافق عليها</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-blue-600">
            {bookings.filter(b => b.bookingType === 'rent').length}
          </div>
          <div className="text-sm text-gray-600">إيجار</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {bookings.filter(b => b.bookingType === 'sale').length}
          </div>
          <div className="text-sm text-gray-600">بيع</div>
        </div>
      </div>

      {/* Filters */}
      <div style={ds.components.glassCard} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              بحث
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اسم المستخدم أو رقم الهاتف..."
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
              <option value="cancelled">ملغية</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              النوع
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="rent">إيجار</option>
              <option value="sale">بيع</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={ds.components.glassCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المستخدم</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>النوع</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المبلغ</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الأقساط</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>التاريخ</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    لا توجد طلبات حجز
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-sm">{booking.userId?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.userId?.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-sm">{booking.propertyId?.title || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {booking.propertyId?.location?.area}, {booking.propertyId?.location?.city}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getTypeBadge(booking.bookingType)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold">{booking.totalAmount?.toLocaleString()} ر.ق</div>
                      {booking.bookingType === 'rent' && booking.monthlyAmount && (
                        <div className="text-xs text-gray-500">{booking.monthlyAmount.toLocaleString()} ر.ق/شهر</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {booking.bookingType === 'rent' ? (
                        <div className="text-sm">
                          {booking.installments?.filter(i => i.status === 'paid').length || 0} / {booking.numberOfInstallments || 0}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{new Date(booking.createdAt).toLocaleDateString('ar-QA')}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/bookings/${booking._id}`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          عرض
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleReject(booking._id)}
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
