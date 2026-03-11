'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useParams, useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Installment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'card' | 'cash';
  paidAt?: string;
  paidAmount?: number;
  receiptUrl?: string;
  notes?: string;
}

interface Booking {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
    images: Array<{ url: string; isCover: boolean }>;
  };
  bookingType: 'rent' | 'sale';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalAmount: number;
  monthlyAmount?: number;
  numberOfInstallments?: number;
  startDate?: string;
  endDate?: string;
  installments?: Installment[];
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export default function AdminBookingDetailPage() {
  const { token } = useAdminAuthStore();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (token && bookingId) {
      fetchBooking();
    }
  }, [token, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/properties/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
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
        fetchBooking(); // Refresh
      }
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleReject = async () => {
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
        fetchBooking(); // Refresh
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleMarkInstallmentPaid = async (installmentNumber: number, installmentAmount: number) => {
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
        fetchBooking(); // Refresh
      }
    } catch (error) {
      console.error('Error marking installment as paid:', error);
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getInstallmentStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">الحجز غير موجود</h2>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="text-blue-500 underline"
          >
            العودة إلى قائمة الحجوزات
          </button>
        </div>
      </div>
    );
  }

  const coverImage = booking.propertyId?.images?.find(img => img.isCover) || booking.propertyId?.images?.[0];
  const paidInstallments = booking.installments?.filter(i => i.status === 'paid').length || 0;
  const overdueInstallments = booking.installments?.filter(i => i.status === 'overdue').length || 0;

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/bookings')}
            className="text-gray-600 hover:text-black mb-2 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            العودة إلى قائمة الحجوزات
          </button>
          <h1 className="text-3xl font-bold" style={{ color: ds.colors.primary.black }}>
            تفاصيل الحجز
          </h1>
        </div>

        {/* Status Badge */}
        <div>
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات العقار</h3>
            <div className="flex gap-4">
              {/* Property Image */}
              <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                {coverImage ? (
                  <img src={coverImage.url} alt={booking.propertyId?.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">لا صورة</span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">{booking.propertyId?.title || 'N/A'}</h4>
                <div className="text-sm text-gray-600 mb-2">
                  {booking.propertyId?.location?.area}, {booking.propertyId?.location?.city}
                </div>
                <button
                  onClick={() => router.push(`/admin/properties/${booking.propertyId?._id}`)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  عرض تفاصيل العقار →
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات المستخدم</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">الاسم</span>
                <p className="font-semibold">{booking.userId?.fullName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">رقم الهاتف</span>
                <p className="font-semibold">{booking.userId?.phone || 'N/A'}</p>
              </div>
              {booking.userId?.email && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-600 block mb-1">البريد الإلكتروني</span>
                  <p className="font-semibold">{booking.userId.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Installments (RENT ONLY) */}
          {booking.bookingType === 'rent' && booking.installments && booking.installments.length > 0 && (
            <div style={ds.components.glassCard}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">جدول الأقساط الشهرية</h3>
                <div className="text-sm text-gray-600">
                  {paidInstallments} / {booking.numberOfInstallments} مدفوع
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>#</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>تاريخ الاستحقاق</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المبلغ</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>طريقة الدفع</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>تاريخ الدفع</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.installments.map((installment) => (
                      <tr key={installment.installmentNumber} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 font-semibold">{installment.installmentNumber}</td>
                        <td className="py-3 px-3 text-sm">{new Date(installment.dueDate).toLocaleDateString('ar-QA')}</td>
                        <td className="py-3 px-3 text-sm font-semibold">{installment.amount.toLocaleString()} ر.ق</td>
                        <td className="py-3 px-3">{getInstallmentStatusBadge(installment.status)}</td>
                        <td className="py-3 px-3 text-sm">
                          {installment.paymentMethod === 'card' ? 'بطاقة' : installment.paymentMethod === 'cash' ? 'نقدي' : '-'}
                        </td>
                        <td className="py-3 px-3 text-sm">
                          {installment.paidAt ? new Date(installment.paidAt).toLocaleDateString('ar-QA') : '-'}
                        </td>
                        <td className="py-3 px-3">
                          {installment.status === 'pending' || installment.status === 'overdue' ? (
                            <button
                              onClick={() => handleMarkInstallmentPaid(installment.installmentNumber, installment.amount)}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600"
                            >
                              تحديد كمدفوع
                            </button>
                          ) : (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-3">ملاحظات</h3>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {booking.status === 'rejected' && booking.rejectionReason && (
            <div style={ds.components.glassCard} className="bg-red-50 border border-red-200">
              <h3 className="text-lg font-bold mb-2 text-red-800">سبب الرفض</h3>
              <p className="text-sm text-red-700">{booking.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right Column - Summary and Actions */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">النوع</span>
                <span className="font-semibold">
                  {booking.bookingType === 'rent' ? (
                    <span className="text-blue-600">إيجار</span>
                  ) : (
                    <span className="text-green-600">بيع</span>
                  )}
                </span>
              </div>

              {booking.bookingType === 'rent' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">الإيجار الشهري</span>
                    <span className="font-semibold">{booking.monthlyAmount?.toLocaleString()} ر.ق</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">عدد الأقساط</span>
                    <span className="font-semibold">{booking.numberOfInstallments}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-600">المبلغ الإجمالي</span>
                    <span className="text-xl font-bold">{booking.totalAmount?.toLocaleString()} ر.ق</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">السعر</span>
                  <span className="text-xl font-bold">{booking.totalAmount?.toLocaleString()} ر.ق</span>
                </div>
              )}

              {booking.startDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">تاريخ البداية</span>
                  <span className="font-semibold">{new Date(booking.startDate).toLocaleDateString('ar-QA')}</span>
                </div>
              )}

              {booking.endDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">تاريخ النهاية</span>
                  <span className="font-semibold">{new Date(booking.endDate).toLocaleDateString('ar-QA')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Progress (RENT) */}
          {booking.bookingType === 'rent' && booking.installments && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">حالة الدفع</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">مدفوع</span>
                  <span className="text-2xl font-bold text-green-600">{paidInstallments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">في الانتظار</span>
                  <span className="text-2xl font-bold text-gray-600">
                    {booking.installments.filter(i => i.status === 'pending').length}
                  </span>
                </div>
                {overdueInstallments > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">متأخر</span>
                    <span className="text-2xl font-bold text-red-600">{overdueInstallments}</span>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{
                        width: `${(paidInstallments / (booking.numberOfInstallments || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">
                    {Math.round((paidInstallments / (booking.numberOfInstallments || 1)) * 100)}% مكتمل
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {booking.status === 'pending' && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الإجراءات</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full py-3 px-6 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                >
                  الموافقة على الحجز
                </button>
                <button
                  onClick={handleReject}
                  className="w-full py-3 px-6 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  رفض الحجز
                </button>
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات إضافية</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الطلب</span>
                <span className="font-semibold">{new Date(booking.createdAt).toLocaleDateString('ar-QA')}</span>
              </div>
              {booking.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الموافقة</span>
                  <span className="font-semibold">{new Date(booking.approvedAt).toLocaleDateString('ar-QA')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
