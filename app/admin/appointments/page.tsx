'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Appointment {
  _id: string;
  appointmentType: 'viewing' | 'delivery';
  date: string;
  time: string;
  status: 'confirmed' | 'received' | 'in_progress' | 'agent' | 'unconfirmed';
  userId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: {
      area: string;
      city: string;
    };
    images?: Array<{ url: string; isCover: boolean }>;
  };
  agentId?: {
    _id: string;
    fullName: string;
    phone?: string;
  };
  notes?: string;
  createdAt: string;
}

interface AppointmentsResponse {
  appointments: Appointment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface AppointmentStats {
  total: number;
  byStatus: {
    unconfirmed: number;
    confirmed: number;
    received: number;
    in_progress: number;
    agent: number;
  };
  byType: {
    viewing: number;
    delivery: number;
  };
  recent: Appointment[];
  upcoming: Appointment[];
}

export default function AdminAppointmentsPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });

  useEffect(() => {
    if (token) {
      fetchAppointments();
      fetchStats();
    }
  }, [token, statusFilter, typeFilter, page]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        params.append('appointmentType', typeFilter);
      }

      const response = await fetch(`${API_BASE_URL}/admin/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: AppointmentsResponse = await response.json();
        setAppointments(result.appointments || []);
        setPagination(result.pagination);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/appointments/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: AppointmentStats = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الموعد إلى "${getStatusLabel(newStatus)}"؟`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAppointments();
        fetchStats();
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
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
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
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[type] || ''}`}>
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

  if (loading && !stats) {
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
          إدارة المواعيد
        </h1>
        <p className="text-gray-600">إدارة جميع مواعيد المعاينة والتسليم</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: ds.colors.primary.black }}>
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">إجمالي المواعيد</div>
          </div>
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-3xl font-bold mb-1 text-yellow-600">
              {stats.byStatus.unconfirmed}
            </div>
            <div className="text-sm text-gray-600">غير مؤكد</div>
          </div>
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-3xl font-bold mb-1 text-blue-600">
              {stats.byStatus.confirmed}
            </div>
            <div className="text-sm text-gray-600">مؤكد</div>
          </div>
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-3xl font-bold mb-1 text-green-600">
              {stats.byStatus.received}
            </div>
            <div className="text-sm text-gray-600">تم الاستلام</div>
          </div>
        </div>
      )}

      {/* Type Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-2xl font-bold mb-1 text-purple-600">
              {stats.byType.viewing}
            </div>
            <div className="text-sm text-gray-600">مواعيد المعاينة</div>
          </div>
          <div style={ds.components.glassCard} className="text-center">
            <div className="text-2xl font-bold mb-1 text-orange-600">
              {stats.byType.delivery}
            </div>
            <div className="text-sm text-gray-600">مواعيد التسليم</div>
          </div>
        </div>
      )}

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
              placeholder="ابحث عن موعد..."
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
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="unconfirmed">غير مؤكد</option>
              <option value="confirmed">مؤكد</option>
              <option value="in_progress">جاري التنفيذ</option>
              <option value="received">مكتمل (تم الاستلام)</option>
              <option value="agent">وكيل العقارات</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              النوع
            </label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="viewing">معاينة</option>
              <option value="delivery">تسليم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div style={ds.components.glassCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العميل</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>النوع</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>التاريخ والوقت</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد مواعيد
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {appointment.propertyId?.images?.[0] ? (
                            <img
                              src={appointment.propertyId.images[0].url}
                              alt={appointment.propertyId.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              لا صورة
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-1">{appointment.propertyId?.title || 'عقار محذوف'}</div>
                          <div className="text-xs text-gray-500">
                            {appointment.propertyId?.location?.area || ''} {appointment.propertyId?.location?.city || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold">{appointment.userId?.fullName || 'غير متوفر'}</div>
                      <div className="text-xs text-gray-500">{appointment.userId?.phone || ''}</div>
                    </td>
                    <td className="py-4 px-4">
                      {getTypeBadge(appointment.appointmentType)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{formatDate(appointment.date)}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/admin/appointments/${appointment._id}`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          عرض
                        </button>
                        {appointment.status === 'unconfirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            تأكيد
                          </button>
                        )}
                        {appointment.status === 'confirmed' && appointment.appointmentType === 'delivery' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'received')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                          >
                            تم التسليم
                          </button>
                        )}
                        {appointment.status === 'confirmed' && appointment.appointmentType === 'viewing' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'in_progress')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                          >
                            بدء المعاينة
                          </button>
                        )}
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'received')}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                          >
                            إنهاء
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(appointment._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              صفحة {page} من {pagination.pages} ({pagination.total} موعد)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
