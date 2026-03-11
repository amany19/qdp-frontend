'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassChip } from '../../../components/ui/GlassChip';
import { GlassModal } from '../../../components/ui/GlassModal';
import { adminAppliancesService, ApplianceRental } from '../../../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function RentalRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [rental, setRental] = useState<ApplianceRental | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangePaymentModal, setShowChangePaymentModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal form states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'card' | 'cash'>('card');
  const [paidAmount, setPaidAmount] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (id) {
      fetchRentalDetails();
    }
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const data = await adminAppliancesService.getRentalRequest(id);
      setRental(data);
      setDeliveryAddress(data.deliveryAddress || '');
    } catch (error) {
      console.error('Error fetching rental:', error);
      toast.error('فشل في تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await adminAppliancesService.approveRental(id, {
        deliveryAddress: deliveryAddress || undefined,
      });
      toast.success('تم الموافقة على الطلب بنجاح');
      setShowApproveModal(false);
      fetchRentalDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error approving rental:', error);
      toast.error(err.response?.data?.message || 'فشل في الموافقة على الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('الرجاء إدخال سبب الرفض');
      return;
    }

    try {
      setActionLoading(true);
      await adminAppliancesService.rejectRental(id, rejectionReason);
      toast.success('تم رفض الطلب');
      setShowRejectModal(false);
      fetchRentalDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error rejecting rental:', error);
      toast.error(err.response?.data?.message || 'فشل في رفض الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePaymentMethod = async () => {
    if (selectedInstallment === null) return;

    try {
      setActionLoading(true);
      await adminAppliancesService.updateInstallment(id, selectedInstallment, {
        paymentMethod: newPaymentMethod,
      });
      toast.success('تم تغيير طريقة الدفع بنجاح');
      setShowChangePaymentModal(false);
      setSelectedInstallment(null);
      fetchRentalDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error changing payment method:', error);
      toast.error(err.response?.data?.message || 'فشل في تغيير طريقة الدفع');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (selectedInstallment === null) return;

    if (!paidAmount || parseFloat(paidAmount) <= 0) {
      toast.error('الرجاء إدخال المبلغ المدفوع');
      return;
    }

    try {
      setActionLoading(true);
      await adminAppliancesService.markInstallmentPaid(id, selectedInstallment, {
        paidAmount: parseFloat(paidAmount),
        paidAt: new Date(paidDate),
      });
      toast.success('تم تحديد القسط كمدفوع');
      setShowMarkPaidModal(false);
      setSelectedInstallment(null);
      setPaidAmount('');
      fetchRentalDetails();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error marking as paid:', error);
      toast.error(err.response?.data?.message || 'فشل في تحديد القسط كمدفوع');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'paid':
        return '#10B981';
      case 'overdue':
        return '#EF4444';
      case 'cancelled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'paid':
        return 'مدفوع';
      case 'overdue':
        return 'متأخر';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '24px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #E5E7EB',
          borderTop: '3px solid #D9D1BE',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!rental) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        color: '#6B7280'
      }}>
        لم يتم العثور على الطلب
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <GlassButton
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#000'
            }}
          >
            ← رجوع
          </GlassButton>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            تفاصيل طلب التأجير
          </h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Rental Information */}
        <GlassCard>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            معلومات التأجير
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>الجهاز:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px', fontSize: '16px' }}>
                {rental.applianceId?.nameAr}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                {rental.applianceId?.brand} {rental.applianceId?.model}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>المدة:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {rental.durationMonths} شهر
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>السعر/شهر:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {rental.monthlyAmount} ر.ق
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>التأمين:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {rental.deposit} ر.ق
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>تاريخ البدء:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {new Date(rental.startDate).toLocaleDateString('ar-QA')}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>تاريخ الانتهاء:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {new Date(rental.endDate).toLocaleDateString('ar-QA')}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>الإجمالي:</span>
              <div style={{ fontWeight: '700', color: '#111827', marginTop: '4px', fontSize: '18px' }}>
                {rental.totalAmount.toLocaleString()} ر.ق
              </div>
            </div>
          </div>
        </GlassCard>

        {/* User Information */}
        <GlassCard>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            معلومات المستأجر
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>الاسم:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                {rental.userId?.fullName || 'غير معروف'}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>الهاتف:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px', direction: 'ltr', textAlign: 'right' }}>
                {rental.userId?.phone || '-'}
              </div>
            </div>

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>البريد الإلكتروني:</span>
              <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px', direction: 'ltr', textAlign: 'right' }}>
                {rental.userId?.email || '-'}
              </div>
            </div>

            {rental.deliveryAddress && (
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>عنوان التسليم:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {rental.deliveryAddress}
                </div>
              </div>
            )}

            <div>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>حالة الطلب:</span>
              <div style={{ marginTop: '8px' }}>
                <GlassChip
                  label={rental.status}
                  color={getStatusColor(rental.status)}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Actions Panel */}
      {rental.status === 'pending' && (
        <GlassCard style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>
            إجراءات
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <GlassButton
              onClick={() => setShowApproveModal(true)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: '600'
              }}
            >
              الموافقة على الطلب
            </GlassButton>
            <GlassButton
              onClick={() => setShowRejectModal(true)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff',
                fontWeight: '600'
              }}
            >
              رفض الطلب
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Installments Table */}
      {rental.installments && rental.installments.length > 0 && (
        <GlassCard>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            جدول الأقساط الشهرية ({rental.installments.length} قسط)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>القسط</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>تاريخ الاستحقاق</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المبلغ</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الحالة</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>طريقة الدفع</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>تاريخ الدفع</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rental.installments.map((installment) => (
                  <tr
                    key={installment.installmentNumber}
                    style={{
                      borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
                      background: installment.status === 'overdue' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                      القسط {installment.installmentNumber}
                    </td>
                    <td style={{ padding: '16px', color: '#374151' }}>
                      {new Date(installment.dueDate).toLocaleDateString('ar-QA')}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>
                      {installment.amount} ر.ق
                    </td>
                    <td style={{ padding: '16px' }}>
                      <GlassChip
                        label={getStatusLabel(installment.status)}
                        color={getStatusColor(installment.status)}
                      />
                    </td>
                    <td style={{ padding: '16px' }}>
                      <GlassChip
                        label={installment.paymentMethod === 'card' ? 'بطاقة' : 'نقدي'}
                        color="#6B7280"
                      />
                    </td>
                    <td style={{ padding: '16px', color: '#374151' }}>
                      {installment.paidAt
                        ? new Date(installment.paidAt).toLocaleDateString('ar-QA')
                        : '-'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {installment.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment.installmentNumber);
                                setNewPaymentMethod(installment.paymentMethod);
                                setShowChangePaymentModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#3B82F6',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              تغيير
                            </button>
                            <button
                              onClick={() => {
                                setSelectedInstallment(installment.installmentNumber);
                                setPaidAmount(installment.amount.toString());
                                setShowMarkPaidModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#10B981',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              مدفوع
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <GlassModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title="الموافقة على طلب التأجير"
        >
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                عنوان التسليم (اختياري)
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="أدخل عنوان التسليم..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <GlassButton
                onClick={() => setShowApproveModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: '#000'
                }}
                disabled={actionLoading}
              >
                إلغاء
              </GlassButton>
              <GlassButton
                onClick={handleApprove}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: '600'
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'جاري المعالجة...' : 'موافقة'}
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <GlassModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="رفض طلب التأجير"
        >
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                سبب الرفض *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="أدخل سبب رفض الطلب..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <GlassButton
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: '#000'
                }}
                disabled={actionLoading}
              >
                إلغاء
              </GlassButton>
              <GlassButton
                onClick={handleReject}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#fff',
                  fontWeight: '600'
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'جاري الرفض...' : 'رفض'}
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Change Payment Method Modal */}
      {showChangePaymentModal && (
        <GlassModal
          isOpen={showChangePaymentModal}
          onClose={() => {
            setShowChangePaymentModal(false);
            setSelectedInstallment(null);
          }}
          title="تغيير طريقة الدفع"
        >
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '12px'
              }}>
                طريقة الدفع الجديدة
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setNewPaymentMethod('card')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: newPaymentMethod === 'card'
                      ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    border: newPaymentMethod === 'card'
                      ? '2px solid #D9D1BE'
                      : '1px solid rgba(212, 197, 176, 0.4)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000',
                    transition: 'all 0.2s ease'
                  }}
                >
                  بطاقة
                </button>
                <button
                  onClick={() => setNewPaymentMethod('cash')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: newPaymentMethod === 'cash'
                      ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    border: newPaymentMethod === 'cash'
                      ? '2px solid #D9D1BE'
                      : '1px solid rgba(212, 197, 176, 0.4)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000',
                    transition: 'all 0.2s ease'
                  }}
                >
                  نقدي
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <GlassButton
                onClick={() => {
                  setShowChangePaymentModal(false);
                  setSelectedInstallment(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: '#000'
                }}
                disabled={actionLoading}
              >
                إلغاء
              </GlassButton>
              <GlassButton
                onClick={handleChangePaymentMethod}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
                  color: '#000',
                  fontWeight: '600'
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'جاري الحفظ...' : 'حفظ'}
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* Mark Paid Modal */}
      {showMarkPaidModal && (
        <GlassModal
          isOpen={showMarkPaidModal}
          onClose={() => {
            setShowMarkPaidModal(false);
            setSelectedInstallment(null);
            setPaidAmount('');
          }}
          title="تحديد القسط كمدفوع"
        >
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                المبلغ المدفوع (ر.ق) *
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                تاريخ الدفع
              </label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <GlassButton
                onClick={() => {
                  setShowMarkPaidModal(false);
                  setSelectedInstallment(null);
                  setPaidAmount('');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  color: '#000'
                }}
                disabled={actionLoading}
              >
                إلغاء
              </GlassButton>
              <GlassButton
                onClick={handleMarkPaid}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: '600'
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'جاري الحفظ...' : 'تأكيد'}
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
