'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassChip } from '../../components/ui/GlassChip';
import { adminAppliancesService, Appliance } from '../../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function ApplianceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [rentalHistory, setRentalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchApplianceDetails();
      fetchRentalHistory();
    }
  }, [id]);

  const fetchApplianceDetails = async () => {
    try {
      setLoading(true);
      const data = await adminAppliancesService.getApplianceDetails(id);
      // Backend returns { appliance, currentRental, rentalHistory }
      setAppliance(data.appliance);
    } catch (error) {
      console.error('Error fetching appliance:', error);
      toast.error('فشل في تحميل تفاصيل الجهاز');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalHistory = async () => {
    try {
      const data = await adminAppliancesService.getRentalHistory(id);
      // Backend returns { rentals, total, page, totalPages }
      setRentalHistory(data.rentals || []);
    } catch (error) {
      console.error('Error fetching rental history:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'rented':
        return '#3B82F6';
      case 'maintenance':
        return '#F59E0B';
      case 'inactive':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'rented':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      case 'inactive':
        return 'غير نشط';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      refrigerator: 'ثلاجة',
      tv: 'تلفاز',
      washing_machine: 'غسالة',
      ac: 'مكيف',
      oven: 'فرن',
      microwave: 'ميكرويف',
      dishwasher: 'غسالة صحون',
    };
    return types[type] || type;
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

  if (!appliance) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        color: '#6B7280'
      }}>
        لم يتم العثور على الجهاز
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
            {appliance.nameAr}
          </h1>
        </div>
        <GlassButton
          onClick={() => router.push(`/admin/appliances/${id}/edit`)}
          style={{
            background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
            color: '#000',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          تعديل
        </GlassButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Image Gallery */}
        <GlassCard>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            معرض الصور
          </h2>
          {appliance.images && appliance.images.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {appliance.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${appliance.nameAr} - ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6B7280'
            }}>
              لا توجد صور
            </div>
          )}
        </GlassCard>

        {/* Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Appliance Info */}
          <GlassCard>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              معلومات الجهاز
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>النوع:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {getTypeLabel(appliance.applianceType)}
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>الماركة:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.brand}
                </div>
              </div>
              {appliance.model && (
                <div>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>الموديل:</span>
                  <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                    {appliance.model}
                  </div>
                </div>
              )}
              {appliance.color && (
                <div>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>اللون:</span>
                  <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                    {appliance.color}
                  </div>
                </div>
              )}
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>الحالة:</span>
                <div style={{ marginTop: '8px' }}>
                  <GlassChip
                    label={getStatusLabel(appliance.status)}
                    color={getStatusColor(appliance.status)}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Rental Info */}
          <GlassCard>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              معلومات التأجير
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>السعر/شهر:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px', fontSize: '18px' }}>
                  {appliance.monthlyPrice} ر.ق
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>التأمين:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.deposit} ر.ق
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>الحد الأدنى:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.minRentalMonths} شهور
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>الحد الأقصى:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.maxRentalMonths} شهر
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Statistics */}
          <GlassCard>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              إحصائيات التأجير
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>مرات التأجير:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.totalRentals}
                </div>
              </div>
              <div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>مدة الاستخدام:</span>
                <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                  {appliance.totalMonthsRented} شهر
                </div>
              </div>
              {appliance.lastMaintenanceDate && (
                <div>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>آخر صيانة:</span>
                  <div style={{ fontWeight: '600', color: '#111827', marginTop: '4px' }}>
                    {new Date(appliance.lastMaintenanceDate).toLocaleDateString('ar-QA')}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Description */}
      <GlassCard style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px'
        }}>
          الوصف
        </h2>
        <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
          {appliance.descriptionAr || 'لا يوجد وصف'}
        </p>
      </GlassCard>

      {/* Specifications */}
      {appliance.specifications && Object.keys(appliance.specifications).length > 0 && (
        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>
            المواصفات
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(appliance.specifications).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '16px',
                  background: 'rgba(217, 209, 190, 0.1)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
                  {key}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Rental History */}
      <GlassCard>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '20px'
        }}>
          سجل التأجير
        </h2>

        {rentalHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6B7280'
          }}>
            لا يوجد سجل تأجير
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المستأجر</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>من</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>إلى</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>المدة</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>الحالة</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rentalHistory.map((rental) => (
                  <tr key={rental._id} style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.3)' }}>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {rental.userId?.fullName || 'غير معروف'}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {new Date(rental.startDate).toLocaleDateString('ar-QA')}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {new Date(rental.endDate).toLocaleDateString('ar-QA')}
                    </td>
                    <td style={{ padding: '12px', color: '#374151' }}>
                      {rental.durationMonths} شهر
                    </td>
                    <td style={{ padding: '12px' }}>
                      <GlassChip
                        label={rental.status}
                        color="#6B7280"
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <GlassButton
                        onClick={() => router.push(`/admin/appliances/rental-requests/${rental._id}`)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          background: 'rgba(217, 209, 190, 0.2)',
                          color: '#000'
                        }}
                      >
                        عرض
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
