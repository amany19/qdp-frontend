'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyDetail } from '@/hooks/useProperties';
import { useState } from 'react';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/config';

export default function PropertyTransferRequestPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading } = usePropertyDetail(propertyId);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('الرجاء كتابة سبب طلب النقل');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/bookings/transfers/property/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestedPropertyId: propertyId,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Map English error messages to Arabic
        let arabicError = 'فشل تقديم الطلب';

        if (data.message) {
          if (data.message.includes('not available for rent')) {
            arabicError = 'هذا العقار غير متاح للإيجار حالياً';
          } else if (data.message.includes('currently occupied')) {
            arabicError = 'هذا العقار مشغول حالياً ولا يمكن الانتقال إليه';
          } else if (data.message.includes('already in this property')) {
            arabicError = 'أنت بالفعل في هذا العقار';
          } else if (data.message.includes('only available for tenants')) {
            arabicError = 'نقل العقار متاح فقط للمستأجرين وليس لملاك العقارات. إذا كنت تمتلك عقاراً وترغب في الانتقال، يجب عليك بيع عقارك الحالي أولاً';
          } else if (data.message.includes('active rental contract')) {
            arabicError = 'يجب أن يكون لديك عقد إيجار نشط لتتمكن من طلب النقل';
          } else if (data.message.includes('active contract to request')) {
            arabicError = 'يجب أن يكون لديك عقد إيجار نشط لتتمكن من طلب النقل';
          } else if (data.message.includes('pending transfer request')) {
            arabicError = 'لديك طلب نقل قيد المراجعة بالفعل. يرجى الانتظار حتى تتم معالجته';
          } else if (data.message.includes('no longer exists in the system')) {
            arabicError = 'عقارك الحالي لم يعد موجوداً في النظام. يرجى التواصل مع الدعم';
          } else if (data.message.includes('not found')) {
            arabicError = 'العقار المطلوب غير موجود';
          } else {
            arabicError = data.message;
          }
        }

        throw new Error(arabicError);
      }

      // Success - navigate to confirmation or property page
      router.push(`/property/${propertyId}?transfer_submitted=true`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">العقار غير موجود</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-500 underline"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const coverImage = property.images?.find((img: any) => img.isCover) || property.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold">طلب نقل عقار</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">معايير الأهلية</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• يجب أن يكون لديك عقد إيجار نشط حالياً</li>
                <li>• يجب أن تكون جميع الأقساط مدفوعة بدون تأخير</li>
                <li>• يجب أن يكون إيجار العقار الجديد مساوي أو أقل من الحالي</li>
                <li>• يجب أن يكون العقار المطلوب متاحاً للإيجار</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Requested Property Card */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">العقار المطلوب الانتقال إليه</h3>
          </div>

          <div className="p-4">
            <div className="flex gap-4">
              {/* Property Image */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                {coverImage ? (
                  <Image
                    src={coverImage.url}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">لا توجد صورة</span>
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{property.title}</h4>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>{property.location.area}، {property.location.city}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <span>{property.specifications.bedrooms} غرف</span>
                  <span>•</span>
                  <span>{property.specifications.bathrooms} حمام</span>
                  <span>•</span>
                  <span>{property.specifications.areaSqm} متر</span>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    {property.availableFor?.rentPrice?.toLocaleString() || 'N/A'} ر.ق
                  </span>
                  <span className="text-sm text-gray-500"> / شهر</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Request Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">سبب طلب النقل</h3>

          {/* Reason Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اكتب سبب رغبتك في الانتقال إلى هذا العقار <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="مثال: العقار أقرب إلى مكان عملي الجديد..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              يرجى تقديم سبب واضح ومفصل لطلب النقل
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>سيتم مراجعة طلبك من قبل الإدارة وسيتم إشعارك بالنتيجة خلال 3-5 أيام عمل</p>
        </div>
      </div>
    </div>
  );
}
