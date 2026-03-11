'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { API_BASE_URL } from '@/lib/config';

interface PropertyBooking {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
    images: Array<{ url: string; isCover: boolean; order: number }>;
    propertyType: string;
    category: string;
  };
  bookingType: 'rent' | 'sale';
  totalAmount: number;
  monthlyAmount?: number;
  numberOfInstallments?: number;
  insuranceDeposit?: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  createdAt: string;
  installments?: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod?: string;
    paidAt?: string;
    paidAmount?: number;
  }>;
  contractId?: {
    _id: string;
    contractNumber: string;
  };
}

export default function BookingDetailsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<PropertyBooking | null>(null);

  useEffect(() => {
    if (token && bookingId) {
      fetchBookingDetails();
    } else if (!token) {
      router.push('/login');
    }
  }, [token, bookingId, router]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        console.error('Failed to fetch booking details');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      paid: 'مدفوع',
      overdue: 'متأخر',
      cancelled: 'ملغي',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على الحجز</h2>
          <button
            onClick={() => router.push('/my-bookings')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            العودة للحجوزات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">تفاصيل الحجز</h1>
          <button
            onClick={() => router.push('/my-bookings')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            العودة للحجوزات
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {booking.propertyId?.images?.[0]?.url && (
                <img
                  src={booking.propertyId.images[0].url}
                  alt={booking.propertyId.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {booking.propertyId?.title || 'N/A'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {booking.propertyId?.location?.area}, {booking.propertyId?.location?.city}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    booking.bookingType === 'rent'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {booking.bookingType === 'rent' ? 'إيجار' : 'بيع'}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            </div>

            {/* Installments Table (for rent bookings) */}
            {booking.bookingType === 'rent' && booking.installments && booking.installments.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">الأقساط الشهرية</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          القسط
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          تاريخ الاستحقاق
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          المبلغ
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الحالة
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          تاريخ الدفع
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {booking.installments.map((installment) => (
                        <tr key={installment.installmentNumber} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            القسط #{installment.installmentNumber}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(installment.dueDate).toLocaleDateString('ar-QA')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {installment.amount.toLocaleString()} ر.ق
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(installment.status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {installment.paidAt
                              ? new Date(installment.paidAt).toLocaleDateString('ar-QA')
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الملخص المالي</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المبلغ الإجمالي</span>
                  <span className="font-bold text-gray-900">
                    {booking.totalAmount.toLocaleString()} ر.ق
                  </span>
                </div>

                {booking.bookingType === 'rent' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الأجرة الشهرية</span>
                      <span className="font-bold text-gray-900">
                        {booking.monthlyAmount?.toLocaleString() || 'N/A'} ر.ق
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">عدد الأقساط</span>
                      <span className="font-bold text-gray-900">
                        {booking.numberOfInstallments || 0} شهر
                      </span>
                    </div>
                    {booking.insuranceDeposit && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">مبلغ التأمين</span>
                        <span className="font-bold text-gray-900">
                          {booking.insuranceDeposit.toLocaleString()} ر.ق
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الحجز</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm block mb-1">تاريخ البداية</span>
                  <span className="font-bold text-gray-900">
                    {new Date(booking.startDate).toLocaleDateString('ar-QA')}
                  </span>
                </div>

                {booking.endDate && (
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">تاريخ النهاية</span>
                    <span className="font-bold text-gray-900">
                      {new Date(booking.endDate).toLocaleDateString('ar-QA')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-600 text-sm block mb-1">تاريخ الحجز</span>
                  <span className="font-bold text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString('ar-QA')}
                  </span>
                </div>

                {booking.contractId?.contractNumber && (
                  <div>
                    <span className="text-gray-600 text-sm block mb-1">رقم العقد</span>
                    <span className="font-bold text-gray-900">
                      {booking.contractId.contractNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {booking.status === 'approved' || booking.status === 'active' ? (
              <button
                onClick={() => router.push(`/property/${booking.propertyId._id}`)}
                className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                عرض العقار
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
