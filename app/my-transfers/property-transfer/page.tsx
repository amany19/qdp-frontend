'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { transferService } from '@/services/transferService';

export default function PropertyTransferPage() {
  const router = useRouter();
  const [requestedPropertyId, setRequestedPropertyId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedPropertyId.trim()) {
      setError('يرجى إدخال معرف الوحدة المطلوبة');
      return;
    }
    if (reason.trim().length < 10) {
      setError('يرجى إدخال سبب الطلب (10 أحرف على الأقل)');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await transferService.createPropertyTransfer(requestedPropertyId.trim(), reason.trim());
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
        title="نقل إلى وحدة أخرى"
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
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <p className="text-sm text-gray-600">طلب نقل إقامتك من الوحدة الحالية إلى وحدة أخرى. أدخل معرف الوحدة التي تريد الانتقال إليها (يمكنك الحصول عليه من قائمة الوحدات أو الدعم).</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">معرف الوحدة المطلوبة</label>
            <input
              type="text"
              value={requestedPropertyId}
              onChange={(e) => setRequestedPropertyId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              placeholder="معرف الوحدة (ID)"
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
              placeholder="سبب طلب النقل إلى وحدة أخرى..."
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
      </div>
      <BottomNavigation />
    </div>
  );
}
