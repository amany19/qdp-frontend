'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';
import HeaderCard from '@/components/ui/HeaderCard';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { transferService } from '@/services/transferService';
import { propertyService } from '@/services/propertyService';

interface PropertyItem {
  _id: string;
  title: string;
  location?: { city?: string; area?: string };
  images?: Array<{ url: string; isCover?: boolean }>;
  specifications?: {
    areaSqm?: number;
    bedrooms?: number;
    bathrooms?: number;
    kitchen?: number;
  };
  availableFor?: {
    rent?: boolean;
    sale?: boolean;
    rentPrice?: number;
    salePrice?: number;
    insuranceDeposit?: number;
  };
}

export default function PropertyTransferPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [requestedPropertyId, setRequestedPropertyId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingProperties(true);
      try {
        const data = await propertyService.getProperties({ limit: 100, offset: 0 });
        const list = Array.isArray(data?.properties)
          ? data.properties
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        if (!cancelled) {
          const sorted = [...list].sort((a: PropertyItem, b: PropertyItem) =>
            (a.title || '').localeCompare(b.title || '', 'ar')
          );
          setProperties(sorted);
        }
      } catch {
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoadingProperties(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedPropertyId.trim()) {
      setError('يرجى اختيار الوحدة المطلوبة');
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

  const handlePreview = () => {
    if (requestedPropertyId) router.push(`/property/${requestedPropertyId}`);
  };

  const selectedProperty = requestedPropertyId
    ? properties.find((p) => p._id === requestedPropertyId)
    : null;

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة المطلوبة</label>
            <div className="flex gap-2">
              <select
                value={requestedPropertyId}
                onChange={(e) => setRequestedPropertyId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-w-0"
                dir="rtl"
                disabled={loadingProperties}
              >
                <option value="">اختر الوحدة...</option>
                {properties.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title || p._id}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePreview}
                disabled={!requestedPropertyId || loadingProperties}
                className="shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1"
                title="معاينة الوحدة"
              >
                <ExternalLink className="w-4 h-4" />
                معاينة
              </button>
            </div>
            {loadingProperties && <p className="text-xs text-gray-500 mt-1">جاري تحميل الوحدات...</p>}
          </div>

          {/* Selected unit details – compact preview with specs from backend */}
          {selectedProperty && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg bg-gray-200 shrink-0">
                  {(() => {
                    const img = selectedProperty.images?.find((i: any) => i.isCover) || selectedProperty.images?.[0];
                    const url = img?.url;
                    return url ? (
                      <Image
                        src={url}
                        alt={selectedProperty.title}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">لا صورة</div>
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{selectedProperty.title}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {selectedProperty.specifications?.bedrooms ?? 0} غرف · {selectedProperty.specifications?.bathrooms ?? 0} حمام · {selectedProperty.specifications?.kitchen ?? 1} مطبخ · {selectedProperty.specifications?.areaSqm ?? '—'} م²
                  </p>
                  {selectedProperty.availableFor?.rent && selectedProperty.availableFor?.rentPrice != null && (
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {selectedProperty.availableFor.rentPrice.toLocaleString()} ر.ق/شهر
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              disabled={submitting || loadingProperties}
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
