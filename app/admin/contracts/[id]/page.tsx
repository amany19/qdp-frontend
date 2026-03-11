'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useParams, useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Contract {
  _id: string;
  contractType: 'rent' | 'sale';
  status: string;
  startDate: string;
  endDate?: string;
  amount: number;
  numberOfChecks?: number;
  insuranceAmount?: number;
  contractNumber?: string;
  tenantId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
    identityNumber?: string;
  };
  landlordId: {
    _id: string;
    fullName: string;
    phone: string;
    email?: string;
    identityNumber?: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: {
      area: string;
      city: string;
    };
    images?: Array<{ url: string }>;
  };
  createdAt: string;
  terms?: string[];
  electronicSignatureTenant?: string;
  electronicSignatureLandlord?: string;
  signedAtTenant?: string;
  signedAtLandlord?: string;
  cancellationReason?: string;
  cancellationRequestedAt?: string;
}

export default function AdminContractDetailPage() {
  const { token } = useAdminAuthStore();
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showLandlordSignModal, setShowLandlordSignModal] = useState(false);
  const [landlordSignature, setLandlordSignature] = useState('');

  useEffect(() => {
    if (token && contractId) {
      fetchContract();
    }
  }, [token, contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/contracts/${contractId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setContract(await response.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة العقد؟`)) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/admin/contracts/${contractId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchContract();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleApproveCancellation = async (approved: boolean) => {
    if (!confirm(`هل أنت متأكد من ${approved ? 'الموافقة على' : 'رفض'} طلب الإلغاء؟`)) return;

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/admin/contracts/${contractId}/approve-cancellation`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        fetchContract();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignAsLandlord = async () => {
    if (!landlordSignature.trim()) {
      alert('يرجى إدخال التوقيع');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/admin/contracts/${contractId}/sign-landlord`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: landlordSignature.trim(),
        }),
      });

      if (response.ok) {
        setShowLandlordSignModal(false);
        setLandlordSignature('');
        fetchContract();
        alert('تم توقيع العقد بنجاح');
      } else {
        const error = await response.json();
        alert(error.message || 'فشل في توقيع العقد');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء التوقيع');
    } finally {
      setUpdating(false);
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
      <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">العقد غير موجود</h2>
          <button
            onClick={() => router.push('/admin/contracts')}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            العودة إلى قائمة العقود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #contract-document, #contract-document * {
            visibility: visible;
          }
          #contract-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Landlord Sign Modal */}
      {showLandlordSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLandlordSignModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" dir="rtl">توقيع المؤجر</h2>
            <div className="mb-4" dir="rtl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اكتب اسم المؤجر الكامل
              </label>
              <input
                type="text"
                value={landlordSignature}
                onChange={(e) => setLandlordSignature(e.target.value)}
                placeholder="اكتب الاسم هنا..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl"
                style={{ fontFamily: 'cursive' }}
                dir="rtl"
                autoFocus
              />
              {landlordSignature && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  المعاينة: <span style={{ fontFamily: 'cursive', fontSize: '16px' }}>{landlordSignature}</span>
                </p>
              )}
            </div>
            <div className="flex gap-3" dir="rtl">
              <button
                onClick={handleSignAsLandlord}
                disabled={updating || !landlordSignature.trim()}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'جاري التوقيع...' : 'توقيع'}
              </button>
              <button
                onClick={() => {
                  setShowLandlordSignModal(false);
                  setLandlordSignature('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between no-print">
        <div>
          <button
            onClick={() => router.push('/admin/contracts')}
            className="mb-4 text-gray-600 hover:text-black transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى العقود
          </button>
          <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
            تفاصيل العقد
          </h1>
          <p className="text-gray-600">معاينة وإدارة تفاصيل العقد</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            تصدير / طباعة
          </button>
          {getStatusBadge(contract.status)}
          <span className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            contract.contractType === 'rent' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
          }`}>
            {contract.contractType === 'rent' ? 'إيجار' : 'بيع'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Document */}
          <div id="contract-document" style={ds.components.glassCard} className="p-8">
            {/* Contract Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
              <h2 className="text-3xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
                {contract.contractType === 'rent' ? 'عقد إيجار' : 'عقد بيع عقار'}
              </h2>
              {contract.contractNumber && (
                <p className="text-lg mb-2">
                  <span className="font-semibold">رقم العقد:</span> {contract.contractNumber}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-semibold">تاريخ التحرير:</span> {formatDate(contract.createdAt)}
              </p>
            </div>

            {/* Parties */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h3 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
                أطراف العقد
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-700">
                    الطرف الأول ({contract.contractType === 'rent' ? 'المؤجر' : 'البائع'}):
                  </p>
                  <p className="text-lg">{contract.landlordId?.fullName}</p>
                  {contract.landlordId?.identityNumber && (
                    <p className="text-sm text-gray-600">رقم الهوية: {contract.landlordId.identityNumber}</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">
                    الطرف الثاني ({contract.contractType === 'rent' ? 'المستأجر' : 'المشتري'}):
                  </p>
                  <p className="text-lg">{contract.tenantId?.fullName}</p>
                  {contract.tenantId?.identityNumber && (
                    <p className="text-sm text-gray-600">رقم الهوية: {contract.tenantId.identityNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h3 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
                {contract.contractType === 'rent' ? 'العقار المؤجر' : 'العقار المباع'}
              </h3>
              <p className="text-lg font-semibold mb-2">{contract.propertyId?.title}</p>
              <p className="text-gray-600">
                <span className="font-semibold">العنوان:</span> {contract.propertyId?.location?.city}، {contract.propertyId?.location?.area}
              </p>
            </div>

            {/* Contract Terms */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h3 className="text-xl font-bold mb-6" style={{ color: ds.colors.primary.black }}>
                شروط وأحكام العقد
              </h3>
              {contract.terms && contract.terms.length > 0 ? (
                <div className="space-y-6">
                  {contract.terms.map((term, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {term}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">لا توجد شروط محددة</p>
              )}
            </div>

            {/* Signatures */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: ds.colors.primary.black }}>
                التوقيعات
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Landlord/Seller Signature */}
                <div>
                  <p className="font-semibold mb-3 text-gray-700">
                    توقيع {contract.contractType === 'rent' ? 'المؤجر' : 'البائع'}
                  </p>
                  {contract.electronicSignatureLandlord ? (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      {contract.electronicSignatureLandlord.startsWith('data:image/') ? (
                        <img
                          src={contract.electronicSignatureLandlord}
                          alt="Landlord Signature"
                          className="max-h-24 mx-auto"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="font-arabic text-2xl py-4" style={{ fontFamily: 'cursive' }}>
                            {contract.electronicSignatureLandlord}
                          </p>
                        </div>
                      )}
                      {contract.signedAtLandlord && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          وُقّع في: {formatDate(contract.signedAtLandlord)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                      <p className="text-gray-400">لم يتم التوقيع بعد</p>
                    </div>
                  )}
                </div>

                {/* Tenant/Buyer Signature */}
                <div>
                  <p className="font-semibold mb-3 text-gray-700">
                    توقيع {contract.contractType === 'rent' ? 'المستأجر' : 'المشتري'}
                  </p>
                  {contract.electronicSignatureTenant ? (
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      {contract.electronicSignatureTenant.startsWith('data:image/') ? (
                        <img
                          src={contract.electronicSignatureTenant}
                          alt="Tenant Signature"
                          className="max-h-24 mx-auto"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="font-arabic text-2xl py-4" style={{ fontFamily: 'cursive' }}>
                            {contract.electronicSignatureTenant}
                          </p>
                        </div>
                      )}
                      {contract.signedAtTenant && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          وُقّع في: {formatDate(contract.signedAtTenant)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                      <p className="text-gray-400">لم يتم التوقيع بعد</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Request */}
          {contract.cancellationRequestedAt && (
            <div style={ds.components.glassCard} className="border-2 border-red-300">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                طلب إلغاء العقد
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">السبب:</span> {contract.cancellationReason || 'غير محدد'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-semibold">تاريخ الطلب:</span> {formatDate(contract.cancellationRequestedAt)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApproveCancellation(true)}
                  disabled={updating}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  الموافقة على الإلغاء
                </button>
                <button
                  onClick={() => handleApproveCancellation(false)}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  رفض الطلب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 no-print">
          {/* Contract Metadata */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              معلومات العقد
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">تاريخ البداية</p>
                <p className="font-semibold">{formatDate(contract.startDate)}</p>
              </div>
              {contract.endDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">تاريخ النهاية</p>
                  <p className="font-semibold">{formatDate(contract.endDate)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">القيمة</p>
                <p className="font-semibold">{contract.amount?.toLocaleString('ar-QA')} ر.ق</p>
              </div>
              {contract.numberOfChecks && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">عدد الشيكات</p>
                  <p className="font-semibold">{contract.numberOfChecks}</p>
                </div>
              )}
              {contract.insuranceAmount && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">مبلغ التأمين</p>
                  <p className="font-semibold">{contract.insuranceAmount?.toLocaleString('ar-QA')} ر.ق</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              معلومات الاتصال
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {contract.contractType === 'rent' ? 'المؤجر' : 'البائع'}
                </p>
                <p className="font-semibold">{contract.landlordId?.fullName}</p>
                <p className="text-sm text-gray-600">{contract.landlordId?.phone}</p>
                {contract.landlordId?.email && (
                  <p className="text-sm text-gray-600">{contract.landlordId.email}</p>
                )}
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-500 mb-1">
                  {contract.contractType === 'rent' ? 'المستأجر' : 'المشتري'}
                </p>
                <p className="font-semibold">{contract.tenantId?.fullName}</p>
                <p className="text-sm text-gray-600">{contract.tenantId?.phone}</p>
                {contract.tenantId?.email && (
                  <p className="text-sm text-gray-600">{contract.tenantId.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={ds.components.glassCard}>
            <h2 className="text-xl font-bold mb-4" style={{ color: ds.colors.primary.black }}>
              الإجراءات
            </h2>
            <div className="space-y-3">
              {!contract.electronicSignatureLandlord && (
                <button
                  onClick={() => setShowLandlordSignModal(true)}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  توقيع المؤجر
                </button>
              )}
              {contract.status === 'draft' && (
                <button
                  onClick={() => handleUpdateStatus('active')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  تفعيل العقد
                </button>
              )}
              {contract.status === 'active' && (
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  إنهاء العقد
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
