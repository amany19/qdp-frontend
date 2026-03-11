'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import { adminAppliancesService, Appliance } from '../../../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function EditAppliancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    applianceType: '',
    brand: '',
    model: '',
    color: '',
    descriptionEn: '',
    descriptionAr: '',
    images: [''],
    rentalPrices: {
      oneMonth: 0,
      sixMonths: 0,
      oneYear: 0,
    },
    monthlyPrice: 0,
    deposit: 0,
    minRentalMonths: 3,
    maxRentalMonths: 24,
    status: 'available' as 'available' | 'rented' | 'maintenance' | 'inactive',
    specifications: {} as Record<string, string>,
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    if (id) {
      fetchAppliance();
    }
  }, [id]);

  const fetchAppliance = async () => {
    try {
      setLoading(true);
      const data = await adminAppliancesService.getApplianceDetails(id);
      const appliance = data.appliance;

      setFormData({
        nameEn: appliance.nameEn || '',
        nameAr: appliance.nameAr || '',
        applianceType: appliance.applianceType || '',
        brand: appliance.brand || '',
        model: appliance.model || '',
        color: appliance.color || '',
        descriptionEn: appliance.descriptionEn || '',
        descriptionAr: appliance.descriptionAr || '',
        images: appliance.images && appliance.images.length > 0 ? appliance.images : [''],
        rentalPrices: appliance.rentalPrices || {
          oneMonth: 0,
          sixMonths: 0,
          oneYear: 0,
        },
        monthlyPrice: appliance.monthlyPrice || 0,
        deposit: appliance.deposit || 0,
        minRentalMonths: appliance.minRentalMonths || 3,
        maxRentalMonths: appliance.maxRentalMonths || 24,
        status: appliance.status || 'available',
        specifications: appliance.specifications || {},
      });
    } catch (error) {
      console.error('Error fetching appliance:', error);
      toast.error('فشل في تحميل الجهاز');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nameAr || !formData.applianceType || !formData.brand) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.rentalPrices.oneMonth <= 0 || formData.rentalPrices.sixMonths <= 0 || formData.rentalPrices.oneYear <= 0) {
      toast.error('يرجى إدخال جميع أسعار الباقات');
      return;
    }

    if (formData.deposit <= 0) {
      toast.error('يرجى إدخال مبلغ التأمين');
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty images and use Arabic for English fields
      const cleanedData = {
        ...formData,
        nameEn: formData.nameAr, // Use Arabic name for English as well
        descriptionEn: formData.descriptionAr, // Use Arabic description for English as well
        images: formData.images.filter(img => img.trim() !== ''),
      };

      await adminAppliancesService.updateAppliance(id, cleanedData);
      toast.success('تم تحديث الجهاز بنجاح');
      router.push(`/admin/appliances/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error updating appliance:', error);
      toast.error(err.response?.data?.message || 'فشل في تحديث الجهاز');
    } finally {
      setSubmitting(false);
    }
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const removeImageField = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey]: specValue,
        },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({
      ...formData,
      specifications: newSpecs,
    });
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

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
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
            تعديل الجهاز
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            معلومات أساسية
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                اسم الجهاز *
              </label>
              <GlassInput
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                نوع الجهاز *
              </label>
              <select
                value={formData.applianceType}
                onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                required
              >
                <option value="">اختر النوع</option>
                <option value="refrigerator">ثلاجة</option>
                <option value="tv">تلفاز</option>
                <option value="washing_machine">غسالة</option>
                <option value="ac">مكيف</option>
                <option value="oven">فرن</option>
                <option value="microwave">ميكرويف</option>
                <option value="dishwasher">غسالة صحون</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الحالة *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                required
              >
                <option value="available">متاح</option>
                <option value="rented">مؤجر</option>
                <option value="maintenance">صيانة</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الماركة *
              </label>
              <GlassInput
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الموديل
              </label>
              <GlassInput
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                اللون
              </label>
              <GlassInput
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الوصف
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 197, 176, 0.4)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            معلومات التأجير
          </h2>

          {/* Rental Price Packages */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              باقات الأسعار (تظهر للمستخدم عند الحجز)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  سعر الشهر الواحد (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  value={formData.rentalPrices.oneMonth}
                  onChange={(e) => setFormData({
                    ...formData,
                    rentalPrices: {
                      ...formData.rentalPrices,
                      oneMonth: parseFloat(e.target.value) || 0
                    },
                    monthlyPrice: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  سعر 6 شهور (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  value={formData.rentalPrices.sixMonths}
                  onChange={(e) => setFormData({
                    ...formData,
                    rentalPrices: {
                      ...formData.rentalPrices,
                      sixMonths: parseFloat(e.target.value) || 0
                    }
                  })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  سعر السنة (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  value={formData.rentalPrices.oneYear}
                  onChange={(e) => setFormData({
                    ...formData,
                    rentalPrices: {
                      ...formData.rentalPrices,
                      oneYear: parseFloat(e.target.value) || 0
                    }
                  })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Deposit and Rental Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                التأمين (ر.ق) *
              </label>
              <GlassInput
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الحد الأدنى للتأجير (شهور) *
              </label>
              <GlassInput
                type="number"
                value={formData.minRentalMonths}
                onChange={(e) => setFormData({ ...formData, minRentalMonths: parseInt(e.target.value) || 3 })}
                min="1"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                الحد الأقصى للتأجير (شهور) *
              </label>
              <GlassInput
                type="number"
                value={formData.maxRentalMonths}
                onChange={(e) => setFormData({ ...formData, maxRentalMonths: parseInt(e.target.value) || 24 })}
                min="1"
                required
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            صور الجهاز
          </h2>

          {formData.images.map((image, index) => (
            <div key={index} style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <GlassInput
                  type="text"
                  placeholder="رابط الصورة (URL)"
                  value={image}
                  onChange={(e) => updateImageField(index, e.target.value)}
                />
              </div>
              {formData.images.length > 1 && (
                <GlassButton
                  type="button"
                  onClick={() => removeImageField(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#DC2626',
                    padding: '12px 20px'
                  }}
                >
                  حذف
                </GlassButton>
              )}
            </div>
          ))}

          <GlassButton
            type="button"
            onClick={addImageField}
            style={{
              background: 'rgba(217, 209, 190, 0.2)',
              color: '#000',
              padding: '12px 24px'
            }}
          >
            + إضافة صورة
          </GlassButton>
        </GlassCard>

        <GlassCard style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            المواصفات
          </h2>

          {/* Display existing specifications */}
          {Object.keys(formData.specifications).length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(217, 209, 190, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{key}:</span>{' '}
                    <span style={{ color: '#6B7280' }}>{value}</span>
                  </div>
                  <GlassButton
                    type="button"
                    onClick={() => removeSpecification(key)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#DC2626',
                      padding: '6px 12px',
                      fontSize: '13px'
                    }}
                  >
                    حذف
                  </GlassButton>
                </div>
              ))}
            </div>
          )}

          {/* Add new specification */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
            <GlassInput
              type="text"
              placeholder="المفتاح (مثلاً: السعة)"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
            />
            <GlassInput
              type="text"
              placeholder="القيمة (مثلاً: 500 لتر)"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
            />
            <GlassButton
              type="button"
              onClick={addSpecification}
              style={{
                background: 'rgba(217, 209, 190, 0.2)',
                color: '#000',
                padding: '12px 24px'
              }}
            >
              إضافة
            </GlassButton>
          </div>
        </GlassCard>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <GlassButton
            type="button"
            onClick={() => router.back()}
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#000',
              padding: '12px 32px'
            }}
          >
            إلغاء
          </GlassButton>
          <GlassButton
            type="submit"
            disabled={submitting}
            style={{
              background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
              color: '#000',
              padding: '12px 32px',
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
