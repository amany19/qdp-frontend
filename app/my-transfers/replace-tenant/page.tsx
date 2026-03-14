'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { transferService, type NewTenantOrOwnerInfo } from '@/services/transferService';

const emptyInfo: NewTenantOrOwnerInfo = { fullName: '', phone: '', email: '', qatarId: '' };

export default function ReplaceTenantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';

  const [info, setInfo] = useState<NewTenantOrOwnerInfo>(emptyInfo);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) {
      setError('يرجى الدخول من صفحة وحدتي لطلب الاستبدال');
      return;
    }
    if (!info.fullName.trim() || !info.phone.trim() || !info.email.trim() || !info.qatarId.trim()) {
      setError('يرجى تعبئة جميع بيانات المستأجر الجديد');
      return;
    }
    if (reason.trim().length < 10) {
      setError('يرجى إدخال سبب الطلب (10 أحرف على الأقل)');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await transferService.createReplaceTenant(bookingId, info, reason.trim());
      router.push('/my-transfers');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'فشل في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      <HeaderCard
        title="طلب استبدال مستأجر"
        leftButton={
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5 text-gray-900" />
          </button>
        }
      />
      <div className="px-4 py-6 max-w-lg mx-auto">
        {!bookingId ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-gray-600 mb-4">يرجى الدخول من صفحة وحدتي لطلب استبدال المستأجر.</p>
            <button
              type="button"
              onClick={() => router.push('/my-unit')}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium"
            >
              الذهاب لوحدتي
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-sm text-gray-600">بيانات المستأجر الجديد الذي سيحل محلّك في الوحدة</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={info.fullName}
                onChange={(e) => setInfo((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                placeholder="الاسم الكامل"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={info.phone}
                onChange={(e) => setInfo((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                placeholder="+974..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={info.email}
                onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية (قطر)</label>
              <input
                type="text"
                value={info.qatarId}
                onChange={(e) => setInfo((p) => ({ ...p, qatarId: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                placeholder="رقم الهوية"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سبب الطلب</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                rows={3}
                placeholder="سبب طلب استبدال المستأجر..."
                dir="rtl"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </div>
          </form>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
