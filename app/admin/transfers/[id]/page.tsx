'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useParams, useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface TransferRequest {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  currentPropertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
    images: Array<{ url: string; isCover: boolean }>;
    availableFor?: { rentPrice?: number };
  };
  requestedPropertyId: {
    _id: string;
    title: string;
    location: { area: string; city: string };
    images: Array<{ url: string; isCover: boolean }>;
    availableFor?: { rentPrice?: number };
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

export default function AdminTransferDetailPage() {
  const { token } = useAdminAuthStore();
  const params = useParams();
  const router = useRouter();
  const transferId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<TransferRequest | null>(null);

  useEffect(() => {
    if (token && transferId) {
      fetchTransfer();
    }
  }, [token, transferId]);

  const fetchTransfer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/properties/transfers/${transferId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransfer(data);
      }
    } catch (error) {
      console.error('Error fetching transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const notes = prompt('ملاحظات الموافقة (اختياري):');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/transfers/${transferId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes: notes || undefined }),
      });

      if (response.ok) {
        fetchTransfer(); // Refresh
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
    }
  };

  const handleReject = async () => {
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
        fetchTransfer(); // Refresh
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || ''}`}>
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

  if (!transfer) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">الطلب غير موجود</h2>
          <button
            onClick={() => router.push('/admin/transfers')}
            className="text-blue-500 underline"
          >
            العودة إلى قائمة الطلبات
          </button>
        </div>
      </div>
    );
  }

  const currentPropertyImage = transfer.currentPropertyId?.images?.find(img => img.isCover) || transfer.currentPropertyId?.images?.[0];
  const requestedPropertyImage = transfer.requestedPropertyId?.images?.find(img => img.isCover) || transfer.requestedPropertyId?.images?.[0];

  const allEligibilityMet = transfer.eligibilityCheck.similarUnitAvailable &&
                              transfer.eligibilityCheck.noLatePayments &&
                              transfer.eligibilityCheck.allInstallmentsPaid;

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/transfers')}
            className="text-gray-600 hover:text-black mb-2 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            العودة إلى قائمة طلبات النقل
          </button>
          <h1 className="text-3xl font-bold" style={{ color: ds.colors.primary.black }}>
            تفاصيل طلب النقل
          </h1>
        </div>

        {/* Status Badge */}
        <div>
          {getStatusBadge(transfer.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Transfer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات المستأجر</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">الاسم</span>
                <p className="font-semibold">{transfer.userId?.fullName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">رقم الهاتف</span>
                <p className="font-semibold">{transfer.userId?.phone || 'N/A'}</p>
              </div>
              {transfer.userId?.email && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-600 block mb-1">البريد الإلكتروني</span>
                  <p className="font-semibold">{transfer.userId.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Property Comparison */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">مقارنة العقارات</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Current Property */}
              <div className="border-r border-gray-200 pr-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">العقار الحالي</h4>
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                  {currentPropertyImage ? (
                    <img src={currentPropertyImage.url} alt={transfer.currentPropertyId?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">لا صورة</span>
                    </div>
                  )}
                </div>
                <p className="font-bold mb-1">{transfer.currentPropertyId?.title || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {transfer.currentPropertyId?.location?.area}, {transfer.currentPropertyId?.location?.city}
                </p>
                {transfer.currentPropertyId?.availableFor?.rentPrice && (
                  <p className="text-lg font-bold text-blue-600">
                    {transfer.currentPropertyId.availableFor.rentPrice.toLocaleString()} ر.ق/شهر
                  </p>
                )}
                <button
                  onClick={() => router.push(`/admin/properties/${transfer.currentPropertyId?._id}`)}
                  className="text-xs text-blue-500 hover:underline mt-2"
                >
                  عرض التفاصيل →
                </button>
              </div>

              {/* Requested Property */}
              <div className="pl-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">العقار المطلوب</h4>
                <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                  {requestedPropertyImage ? (
                    <img src={requestedPropertyImage.url} alt={transfer.requestedPropertyId?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">لا صورة</span>
                    </div>
                  )}
                </div>
                <p className="font-bold mb-1">{transfer.requestedPropertyId?.title || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {transfer.requestedPropertyId?.location?.area}, {transfer.requestedPropertyId?.location?.city}
                </p>
                {transfer.requestedPropertyId?.availableFor?.rentPrice && (
                  <p className="text-lg font-bold text-green-600">
                    {transfer.requestedPropertyId.availableFor.rentPrice.toLocaleString()} ر.ق/شهر
                  </p>
                )}
                <button
                  onClick={() => router.push(`/admin/properties/${transfer.requestedPropertyId?._id}`)}
                  className="text-xs text-blue-500 hover:underline mt-2"
                >
                  عرض التفاصيل →
                </button>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-3">سبب طلب النقل</h3>
            <p className="text-gray-700 leading-relaxed">{transfer.reason}</p>
          </div>

          {/* Eligibility Check */}
          <div style={ds.components.glassCard} className={allEligibilityMet ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}>
            <h3 className="text-xl font-bold mb-4">فحص الأهلية</h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                {transfer.eligibilityCheck.similarUnitAvailable ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                )}
                <span className="text-sm">وحدة مماثلة متوفرة</span>
              </div>

              <div className="flex items-center gap-3">
                {transfer.eligibilityCheck.noLatePayments ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                )}
                <span className="text-sm">لا يوجد تأخير في الدفعات</span>
              </div>

              <div className="flex items-center gap-3">
                {transfer.eligibilityCheck.allInstallmentsPaid ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                )}
                <span className="text-sm">جميع الأقساط مدفوعة</span>
              </div>
            </div>

            {transfer.eligibilityCheck.message && (
              <div className={`p-3 rounded-lg ${allEligibilityMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="text-sm font-semibold">{transfer.eligibilityCheck.message}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          {transfer.paymentHistory && transfer.paymentHistory.length > 0 && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">سجل الدفع</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {transfer.paymentHistory.map((payment, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    payment.status === 'on_time' ? 'bg-green-50 border-green-200' :
                    payment.status === 'late' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <p className="text-xs text-gray-600 mb-1">{payment.month}</p>
                    <p className={`text-sm font-semibold ${
                      payment.status === 'on_time' ? 'text-green-700' :
                      payment.status === 'late' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {payment.status === 'on_time' ? 'في الوقت المحدد' :
                       payment.status === 'late' ? `متأخر ${payment.daysLate} يوم` :
                       'غير مدفوع'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {transfer.adminNotes && (
            <div style={ds.components.glassCard} className="bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold mb-2 text-blue-800">ملاحظات الإدارة</h3>
              <p className="text-sm text-blue-700">{transfer.adminNotes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {transfer.status === 'rejected' && transfer.rejectionReason && (
            <div style={ds.components.glassCard} className="bg-red-50 border border-red-200">
              <h3 className="text-lg font-bold mb-2 text-red-800">سبب الرفض</h3>
              <p className="text-sm text-red-700">{transfer.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right Column - Actions and Info */}
        <div className="space-y-6">
          {/* Actions */}
          {transfer.status === 'pending' && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الإجراءات</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full py-3 px-6 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                >
                  الموافقة على النقل
                </button>
                <button
                  onClick={handleReject}
                  className="w-full py-3 px-6 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  رفض النقل
                </button>
              </div>
            </div>
          )}

          {/* Transfer Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات الطلب</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الطلب</span>
                <span className="font-semibold">{new Date(transfer.createdAt).toLocaleDateString('ar-QA')}</span>
              </div>
              {transfer.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الموافقة</span>
                  <span className="font-semibold">{new Date(transfer.approvedAt).toLocaleDateString('ar-QA')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Eligibility Summary */}
          <div style={ds.components.glassCard} className={allEligibilityMet ? 'bg-green-50' : 'bg-red-50'}>
            <h3 className="text-xl font-bold mb-2">حالة الأهلية</h3>
            <p className={`text-3xl font-bold ${allEligibilityMet ? 'text-green-600' : 'text-red-600'}`}>
              {allEligibilityMet ? 'مؤهل' : 'غير مؤهل'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {allEligibilityMet
                ? 'المستأجر يستوفي جميع شروط النقل'
                : 'المستأجر لا يستوفي بعض شروط النقل'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
