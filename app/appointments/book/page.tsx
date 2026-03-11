'use client';

import { useRouter } from 'next/navigation';
import HeaderCard from '@/components/ui/HeaderCard';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';

/**
 * Book appointment page – start flow to book a viewing or delivery appointment.
 */
export default function BookAppointmentPage() {
  const router = useRouter();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
        <HeaderCard
          title="حجز موعد"
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

        <div className="px-5 py-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">موعد معاينة أو تسليم</h2>
                <p className="text-sm text-gray-500">احجز موعداً مع وكيل العقارات</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              ابحث عن الوحدة التي تريدها ثم اطلب موعد معاينة أو موعد تسليم من صفحة الوحدة.
            </p>
            <button
              type="button"
              onClick={() => router.push('/search')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5" />
              البحث عن وحدة
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            يمكنك أيضاً متابعة مواعيدك من قائمة المواعيد.
          </p>
          <button
            type="button"
            onClick={() => router.push('/appointments')}
            className="w-full mt-3 py-2.5 text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            عرض مواعيدي
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
