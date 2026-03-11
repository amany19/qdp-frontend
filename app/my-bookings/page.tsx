'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { API_BASE_URL } from '@/lib/config';

interface PropertyBooking {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
    images: (string | { url: string; isCover?: boolean; order?: number })[];
  };
  bookingType: 'rent' | 'sale';
  totalAmount: number;
  monthlyAmount?: number;
  numberOfInstallments?: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  createdAt: string;
  installments?: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  }>;
}

export default function MyBookingsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [filter, setFilter] = useState<'all' | 'rent' | 'sale'>('all');

  useEffect(() => {
    if (token) {
      fetchBookings();
    } else {
      router.push('/login');
    }
  }, [token, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.bookingType === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موافق عليه',
      active: 'نشط',
      completed: 'مكتمل',
      rejected: 'مرفوض',
      cancelled: 'ملغي',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getNextPaymentInfo = (booking: PropertyBooking) => {
    if (booking.bookingType !== 'rent' || !booking.installments) return null;

    const nextPending = booking.installments.find(i => i.status === 'pending');
    if (!nextPending) return null;

    return {
      amount: nextPending.amount,
      dueDate: new Date(nextPending.dueDate),
      installmentNumber: nextPending.installmentNumber,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">حجوزاتي</h1>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            العودة للملف الشخصي
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('rent')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'rent'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الإيجار ({bookings.filter(b => b.bookingType === 'rent').length})
          </button>
          <button
            onClick={() => setFilter('sale')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'sale'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            البيع ({bookings.filter(b => b.bookingType === 'sale').length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
            <p className="text-gray-600 mb-6">لم تقم بأي حجوزات بعد</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              تصفح العقارات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const nextPayment = getNextPaymentInfo(booking);
              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Property Image */}
                  {booking.propertyId?.images?.[0] && (
                    <img
                      src={
                        typeof booking.propertyId.images[0] === 'string'
                          ? booking.propertyId.images[0]
                          : booking.propertyId.images[0]?.url
                      }
                      alt={booking.propertyId.title}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-6">
                    {/* Property Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {booking.propertyId?.title || 'N/A'}
                    </h3>

                    {/* Location */}
                    <p className="text-sm text-gray-600 mb-3">
                      {booking.propertyId?.location?.area}, {booking.propertyId?.location?.city}
                    </p>

                    {/* Type & Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.bookingType === 'rent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.bookingType === 'rent' ? 'إيجار' : 'بيع'}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</div>
                      <div className="text-xl font-bold text-gray-900">
                        {booking.totalAmount.toLocaleString()} ر.ق
                      </div>
                    </div>

                    {/* Next Payment for Rent */}
                    {nextPayment && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-xs text-yellow-800 mb-1">الدفعة القادمة</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-yellow-900">
                            {nextPayment.amount.toLocaleString()} ر.ق
                          </span>
                          <span className="text-xs text-yellow-700">
                            {nextPayment.dueDate.toLocaleDateString('ar-QA')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => router.push(`/my-bookings/${booking._id}`)}
                      className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

     <BottomNavigation  />
    </div>
  );
}
