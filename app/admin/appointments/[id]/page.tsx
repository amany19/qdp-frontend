'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useParams, useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Appointment {
  _id: string;
  appointmentType: 'viewing' | 'delivery';
  date: string;
  time: string;
  status: 'unconfirmed' | 'confirmed' | 'received' | 'in_progress' | 'agent';
  userId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
    identityNumber?: string;
  };
  propertyId: {
    _id: string;
    title: string;
    propertyType: string;
    location: {
      area: string;
      city: string;
    };
    images?: Array<{ url: string; isCover: boolean }>;
    specifications?: {
      bedrooms: number;
      bathrooms: number;
      areaSqm: number;
    };
  };
  agentId?: {
    _id: string;
    fullName: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminAppointmentDetailPage() {
  const { token } = useAdminAuthStore();
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (token && appointmentId) {
      fetchAppointment();
    }
  }, [token, appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        console.error('Failed to fetch appointment');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الموعد إلى "${getStatusLabel(newStatus)}"؟`)) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAppointment();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/admin/appointments');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unconfirmed: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      agent: 'bg-orange-100 text-orange-800',
    };

    const labels: Record<string, string> = {
      unconfirmed: 'غير مؤكد',
      confirmed: 'مؤكد',
      received: 'استلم',
      in_progress: 'جاري التنفيذ',
      agent: 'وكيل العقارات',
    };

    return (
      <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      viewing: 'bg-purple-100 text-purple-800',
      delivery: 'bg-orange-100 text-orange-800',
    };

    const labels: Record<string, string> = {
      viewing: 'معاينة',
      delivery: 'تسليم',
    };

    return (
      <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${styles[type] || ''}`}>
        {labels[type] || type}
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unconfirmed: 'غير مؤكد',
      confirmed: 'مؤكد',
      received: 'استلم',
      in_progress: 'جاري التنفيذ',
      agent: 'وكيل العقارات',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'غير محدد';
    return date.toLocaleDateString('ar-QA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'غير محدد';
    return date.toLocaleString('ar-QA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الموعد غير موجود</h2>
          <button
            onClick={() => router.push('/admin/appointments')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            العودة إلى قائمة المواعيد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/appointments')}
            className="mb-4 text-gray-600 hover:text-black transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى المواعيد
          </button>
          <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
            تفاصيل الموعد
          </h1>
          <p className="text-gray-600">معاينة وإدارة تفاصيل الموعد</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(appointment.status)}
          {getTypeBadge(appointment.appointmentType)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              معلومات العقار
            </h2>
            <div className="flex gap-4">
              {appointment.propertyId?.images?.[0] && (
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={appointment.propertyId.images[0].url}
                    alt={appointment.propertyId.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{appointment.propertyId?.title || 'عقار محذوف'}</h3>
                {appointment.propertyId && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">النوع:</span> {appointment.propertyId.propertyType}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">الموقع:</span> {appointment.propertyId.location.area}، {appointment.propertyId.location.city}
                    </p>
                    {appointment.propertyId.specifications && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">المواصفات:</span> {appointment.propertyId.specifications.bedrooms} غرف • {appointment.propertyId.specifications.bathrooms} حمام • {appointment.propertyId.specifications.areaSqm}م²
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              تفاصيل الموعد
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ الموعد</p>
                <p className="font-semibold">{formatDate(appointment.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الوقت</p>
                <p className="font-semibold">{appointment.time || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">نوع الموعد</p>
                <p className="font-semibold">{appointment.appointmentType === 'viewing' ? 'معاينة' : 'تسليم'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">الحالة</p>
                <p className="font-semibold">{getStatusLabel(appointment.status)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">تاريخ الإنشاء</p>
                <p className="font-semibold">{formatDateTime(appointment.createdAt)}</p>
              </div>
              {appointment.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">ملاحظات</p>
                  <p className="font-semibold">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Agent Info (if assigned) */}
          {appointment.agentId && (
            <div style={ds.components.glassCard}>
              <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
                معلومات الوكيل
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">الاسم</p>
                  <p className="font-semibold">{appointment.agentId.fullName}</p>
                </div>
                {appointment.agentId.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                    <p className="font-semibold">{appointment.agentId.phone}</p>
                  </div>
                )}
                {appointment.agentId.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                    <p className="font-semibold">{appointment.agentId.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              معلومات العميل
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">الاسم الكامل</p>
                <p className="font-semibold">{appointment.userId?.fullName || 'غير متوفر'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">رقم الهاتف</p>
                <p className="font-semibold">{appointment.userId?.phone || 'غير متوفر'}</p>
              </div>
              {appointment.userId?.email && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold">{appointment.userId.email}</p>
                </div>
              )}
              {appointment.userId?.identityNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">رقم الهوية</p>
                  <p className="font-semibold">{appointment.userId.identityNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              الإجراءات
            </h2>
            <div className="space-y-3">
              {appointment.status === 'unconfirmed' && (
                <button
                  onClick={() => handleUpdateStatus('confirmed')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50"
                >
                  تأكيد الموعد
                </button>
              )}
              {appointment.status === 'confirmed' && appointment.appointmentType === 'delivery' && (
                <button
                  onClick={() => handleUpdateStatus('received')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                >
                  تم التسليم
                </button>
              )}
              {appointment.status === 'confirmed' && appointment.appointmentType === 'viewing' && (
                <button
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50"
                >
                  بدء المعاينة
                </button>
              )}
              {appointment.status === 'in_progress' && (
                <button
                  onClick={() => handleUpdateStatus('received')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                >
                  إنهاء المعاينة
                </button>
              )}
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                حذف الموعد
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
