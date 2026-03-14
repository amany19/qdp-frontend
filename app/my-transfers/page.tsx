'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { transferService, type PropertyTransferItem, type TransferType } from '@/services/transferService';
import HeaderCard from '@/components/ui/HeaderCard';

function getTransferTypeLabel(t: TransferType | undefined): string {
  if (t === 'replace_tenant') return 'استبدال مستأجر';
  if (t === 'ownership_transfer') return 'نقل ملكية';
  return 'نقل إلى وحدة أخرى';
}

function getTargetSummary(transfer: PropertyTransferItem): string {
  if (transfer.transferType === 'replace_tenant' && transfer.newTenantInfo)
    return transfer.newTenantInfo.fullName;
  if (transfer.transferType === 'ownership_transfer' && transfer.newOwnerInfo)
    return transfer.newOwnerInfo.fullName;
  if (transfer.requestedPropertyId?.title) return transfer.requestedPropertyId.title;
  return '—';
}

export default function MyTransfersPage() {
  const { token, user: authUser } = useAuthStore();
  const userType = authUser?.userType;
  const isResident = userType === 'resident';
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<PropertyTransferItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (token) {
      fetchTransfers();
    } else {
      router.push('/auth/login');
    }
  }, [token, router]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await transferService.getList();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <HeaderCard
        title="طلبات النقل"
        leftButton={
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-gray-900" />
          </button>
        }
      />
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            الكل ({transfers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'pending'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            قيد المراجعة ({transfers.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'approved'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            موافق عليه ({transfers.filter(t => t.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'rejected'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            مرفوض ({transfers.filter(t => t.status === 'rejected').length})
          </button>
        </div>

        {/* Transfers List */}
        {filteredTransfers.length === 0 ? (
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات نقل</h3>
            <p className="text-gray-600 mb-6">لم تقم بأي طلبات نقل أو استبدال مستأجر أو نقل ملكية بعد</p>
            <button
              onClick={() => router.push(isResident ? '/my-unit' : '/my-bookings')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isResident ? 'عرض وحدتي وطلب جديد' : 'عرض الحجوزات'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    {(transfer.currentPropertyId as any)?.images?.[0]?.url && (
                      <img
                        src={(transfer.currentPropertyId as any).images[0].url}
                        alt={(transfer.currentPropertyId as any).title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
                          {getTransferTypeLabel(transfer.transferType)}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                          {(transfer.currentPropertyId as any)?.title || 'وحدة حالي'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {(transfer.currentPropertyId as any)?.location?.area}
                          {(transfer.currentPropertyId as any)?.location?.city && `، ${(transfer.currentPropertyId as any).location.city}`}
                        </p>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">
                          {transfer.transferType === 'replace_tenant' ? 'المستأجر الجديد' : transfer.transferType === 'ownership_transfer' ? 'المالك الجديد' : 'الوحدة المطلوبة'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {getTargetSummary(transfer)}
                        </span>
                      </div>
                      {(transfer.newTenantInfo || transfer.newOwnerInfo) && (
                        <>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">رقم الهاتف</span>
                            <span className="text-sm font-medium text-gray-900">
                              {(transfer.newTenantInfo || transfer.newOwnerInfo)?.phone}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">البريد الإلكتروني</span>
                            <span className="text-sm font-medium text-gray-900">
                              {(transfer.newTenantInfo || transfer.newOwnerInfo)?.email}
                            </span>
                          </div>
                        </>
                      )}
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">تاريخ الطلب</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(transfer.createdAt).toLocaleDateString('ar-QA')}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs text-gray-500 block mb-1">السبب</span>
                      <p className="text-sm text-gray-700">{transfer.reason}</p>
                    </div>

                    {transfer.status === 'rejected' && transfer.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-xs text-red-700 block mb-1 font-medium">سبب الرفض</span>
                        <p className="text-sm text-red-800">{transfer.rejectionReason}</p>
                      </div>
                    )}

                    {transfer.status === 'approved' && transfer.approvedAt && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-xs text-green-700 block mb-1 font-medium">تمت الموافقة في</span>
                        <p className="text-sm text-green-800">
                          {new Date(transfer.approvedAt).toLocaleDateString('ar-QA')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
