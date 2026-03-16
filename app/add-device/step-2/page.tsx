'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/auth/RoleGuard';
import HeaderCard from '@/components/ui/HeaderCard';

export default function AddDeviceStep2Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oneMonth: '',
    sixMonths: '',
    oneYear: '',
    deposit: '500',
    minRentalMonths: '3',
    maxRentalMonths: '24',
  });

  useEffect(() => {
    const step1 = sessionStorage.getItem('addDeviceStep1');
    if (!step1) {
      toast.error('الرجاء إكمال الخطوة الأولى');
      router.push('/add-device/step-1');
    }
  }, [router]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    const one = parseFloat(formData.oneMonth);
    const six = parseFloat(formData.sixMonths);
    const year = parseFloat(formData.oneYear);
    if (isNaN(one) || one <= 0 || isNaN(six) || six <= 0 || isNaN(year) || year <= 0) {
      toast.error('الرجاء إدخال أسعار صحيحة لجميع الباقات');
      return;
    }
    if (!formData.deposit || parseFloat(formData.deposit) < 0) {
      toast.error('الرجاء إدخال مبلغ التأمين');
      return;
    }
    sessionStorage.setItem(
      'addDeviceStep2',
      JSON.stringify({
        rentalPrices: { oneMonth: one, sixMonths: six, oneYear: year },
        deposit: parseFloat(formData.deposit),
        minRentalMonths: parseInt(formData.minRentalMonths) || 3,
        maxRentalMonths: parseInt(formData.maxRentalMonths) || 24,
      }),
    );
    router.push('/add-device/step-3');
  };

  return (
    <RoleGuard allowedRoles={['user', 'resident']}>
      <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
        <HeaderCard
          title="إضافة جهاز - الخطوة ٢ (الأسعار)"
          leftButton={
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          }
        />
        <div className="px-5 py-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">سعر شهر واحد (ر.ق) *</label>
            <input
              type="number"
              min="1"
              value={formData.oneMonth}
              onChange={(e) => updateField('oneMonth', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">سعر ٦ أشهر (ر.ق) *</label>
            <input
              type="number"
              min="1"
              value={formData.sixMonths}
              onChange={(e) => updateField('sixMonths', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">سعر سنة (ر.ق) *</label>
            <input
              type="number"
              min="1"
              value={formData.oneYear}
              onChange={(e) => updateField('oneYear', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">مبلغ التأمين (ر.ق)</label>
            <input
              type="number"
              min="0"
              value={formData.deposit}
              onChange={(e) => updateField('deposit', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">أقل مدة إيجار (شهور)</label>
            <input
              type="number"
              min="1"
              value={formData.minRentalMonths}
              onChange={(e) => updateField('minRentalMonths', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">أقصى مدة إيجار (شهور)</label>
            <input
              type="number"
              min="1"
              value={formData.maxRentalMonths}
              onChange={(e) => updateField('maxRentalMonths', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-black text-white rounded-lg font-medium"
          >
            متابعة
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}
