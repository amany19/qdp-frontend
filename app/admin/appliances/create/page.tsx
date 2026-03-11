'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { adminAppliancesService } from '../../../../services/adminAppliancesService';
import toast from 'react-hot-toast';

export default function CreateAppliancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    applianceType: 'refrigerator',
    brand: '',
    model: '',
    color: '',
    descriptionAr: '',
    descriptionEn: '',
    deposit: '500',
    minRentalMonths: '3',
    maxRentalMonths: '24',
    status: 'available',
  });
  const [rentalPrices, setRentalPrices] = useState({
    oneMonth: '',
    sixMonths: '',
    oneYear: '',
  });
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr || !formData.brand) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!rentalPrices.oneMonth || !rentalPrices.sixMonths || !rentalPrices.oneYear) {
      toast.error('الرجاء ملء جميع أسعار الباقات');
      return;
    }

    try {
      setLoading(true);

      // Convert specifications array to object
      const specsObject: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key && spec.value) {
          specsObject[spec.key] = spec.value;
        }
      });

      const data = {
        ...formData,
        nameEn: formData.nameAr, // Use Arabic name for English as well
        descriptionEn: formData.descriptionAr, // Use Arabic description for English as well
        rentalPrices: {
          oneMonth: parseFloat(rentalPrices.oneMonth),
          sixMonths: parseFloat(rentalPrices.sixMonths),
          oneYear: parseFloat(rentalPrices.oneYear),
        },
        monthlyPrice: parseFloat(rentalPrices.oneMonth), // Use oneMonth price as base monthly price
        deposit: parseFloat(formData.deposit),
        minRentalMonths: parseInt(formData.minRentalMonths),
        maxRentalMonths: parseInt(formData.maxRentalMonths),
        images,
        specifications: specsObject,
      };

      await adminAppliancesService.createAppliance(data);
      toast.success('تم إضافة الجهاز بنجاح');
      router.push('/admin/appliances');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Error creating appliance:', error);
      toast.error(err.response?.data?.message || 'فشل في إضافة الجهاز');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0
        }}>
          إضافة جهاز جديد
        </h1>
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
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            المعلومات الأساسية
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                اسم الجهاز *
              </label>
              <GlassInput
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                placeholder="مثال: ثلاجة سامسونج"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                النوع *
              </label>
              <select
                name="applianceType"
                value={formData.applianceType}
                onChange={handleChange}
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
                required
              >
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
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الماركة *
              </label>
              <GlassInput
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="مثال: Samsung"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الموديل
              </label>
              <GlassInput
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="مثال: RT38K5110S8"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                اللون
              </label>
              <GlassInput
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="مثال: فضي"
              />
            </div>
          </div>
        </GlassCard>

        {/* Rental Information */}
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
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  سعر الشهر الواحد (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  name="oneMonth"
                  value={rentalPrices.oneMonth}
                  onChange={(e) => setRentalPrices({
                    ...rentalPrices,
                    oneMonth: e.target.value
                  })}
                  placeholder="90"
                  style={{ minWidth: '0' }}
                  required
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  سعر 6 شهور (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  name="sixMonths"
                  value={rentalPrices.sixMonths}
                  onChange={(e) => setRentalPrices({
                    ...rentalPrices,
                    sixMonths: e.target.value
                  })}
                  placeholder="160"
                  style={{ minWidth: '0' }}
                  required
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  سعر السنة (ر.ق) *
                </label>
                <GlassInput
                  type="number"
                  name="oneYear"
                  value={rentalPrices.oneYear}
                  onChange={(e) => setRentalPrices({
                    ...rentalPrices,
                    oneYear: e.target.value
                  })}
                  placeholder="280"
                  style={{ minWidth: '0' }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                التأمين (ر.ق) *
              </label>
              <GlassInput
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="500"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الحد الأدنى للتأجير (شهور)
              </label>
              <GlassInput
                type="number"
                name="minRentalMonths"
                value={formData.minRentalMonths}
                onChange={handleChange}
                placeholder="3"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الحد الأقصى للتأجير (شهور)
              </label>
              <GlassInput
                type="number"
                name="maxRentalMonths"
                value={formData.maxRentalMonths}
                onChange={handleChange}
                placeholder="24"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
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
              >
                <option value="available">متاح</option>
                <option value="maintenance">صيانة</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Description */}
        <GlassCard style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            الوصف
          </h2>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              الوصف
            </label>
            <textarea
              name="descriptionAr"
              value={formData.descriptionAr}
              onChange={handleChange}
              rows={4}
              placeholder="وصف مفصل للجهاز..."
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
        </GlassCard>

        {/* Specifications */}
        <GlassCard style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              المواصفات
            </h2>
            <GlassButton
              type="button"
              onClick={addSpecification}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: 'rgba(217, 209, 190, 0.3)',
                color: '#000'
              }}
            >
              + إضافة مواصفة
            </GlassButton>
          </div>

          {specifications.map((spec, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <GlassInput
                type="text"
                value={spec.key}
                onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                placeholder="مثال: السعة"
              />
              <GlassInput
                type="text"
                value={spec.value}
                onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                placeholder="مثال: 384 لتر"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                حذف
              </button>
            </div>
          ))}

          {specifications.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              لا توجد مواصفات. اضغط على "إضافة مواصفة" للبدء.
            </div>
          )}
        </GlassCard>

        {/* Submit Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px'
        }}>
          <GlassButton
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              color: '#000'
            }}
            disabled={loading}
          >
            إلغاء
          </GlassButton>
          <GlassButton
            type="submit"
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
              color: '#000',
              fontWeight: '600'
            }}
            disabled={loading}
          >
            {loading ? 'جاري الإضافة...' : 'إضافة الجهاز'}
          </GlassButton>
        </div>
      </form>
    </div>
  );
}
