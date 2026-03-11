'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Contract {
  _id: string;
  contractType: 'rent' | 'sale';
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled' | 'terminated';
  startDate: string;
  endDate?: string;
  amount: number;
  tenantId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  landlordId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: {
      area: string;
      city: string;
    };
  };
  createdAt: string;
}

export default function AdminContractsPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, limit: 20 });

  useEffect(() => {
    if (token) {
      fetchContracts();
      fetchStats();
    }
  }, [token, statusFilter, typeFilter, page]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('contractType', typeFilter);

      const response = await fetch(`${API_BASE_URL}/admin/contracts?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setContracts(result.contracts || []);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/contracts/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) setStats(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_signature: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      terminated: 'bg-orange-100 text-orange-800',
    };

    const labels: Record<string, string> = {
      draft: 'مسودة',
      pending_signature: 'بانتظار التوقيع',
      active: 'نشط',
      completed: 'مكتمل',
      cancelled: 'ملغى',
      terminated: 'منتهي',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
        type === 'rent' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
      }`}>
        {type === 'rent' ? 'إيجار' : 'بيع'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'غير محدد';
    return date.toLocaleDateString('ar-QA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
          إدارة العقود
        </h1>
        <p className="text-gray-600">إدارة ومتابعة جميع العقود</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div style={ds.components.glassCard}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي العقود</p>
                <p className="text-2xl font-bold" style={{ color: ds.colors.primary.black }}>
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div style={ds.components.glassCard}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">عقود نشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.byStatus.active}
                </p>
              </div>
            </div>
          </div>

          <div style={ds.components.glassCard}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">عقود إيجار</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.byType.rent}
                </p>
              </div>
            </div>
          </div>

          <div style={ds.components.glassCard}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">عقود بيع</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.byType.sale}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={ds.components.glassCard} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="pending_signature">بانتظار التوقيع</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغى</option>
              <option value="terminated">منتهي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العقد
            </label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">جميع الأنواع</option>
              <option value="rent">إيجار</option>
              <option value="sale">بيع</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div style={ds.components.glassCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العقار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستأجر/المشتري
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القيمة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ البداية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد عقود
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.propertyId?.title}</div>
                      <div className="text-sm text-gray-500">
                        {contract.propertyId?.location?.city}، {contract.propertyId?.location?.area}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.tenantId?.fullName}</div>
                      <div className="text-sm text-gray-500">{contract.tenantId?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(contract.contractType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {contract.amount?.toLocaleString('ar-QA')} ر.ق
                      </div>
                      {contract.contractType === 'rent' && (
                        <div className="text-xs text-gray-500">شهرياً</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contract.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/admin/contracts/${contract._id}`)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              عرض {Math.min((page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(page * pagination.limit, pagination.total)} من {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
