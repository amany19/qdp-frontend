'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HomeHelp() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    router.push('/appointments/book');
  };

  return (
    <div className="px-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md shadow-black/5">
        <h3 className="font-bold text-lg mb-2">تحتاج مساعدة؟</h3>
        <p className="text-gray-600 text-sm mb-4">
          يمكنك الآن حجز موعد مع وكيل العقارات مباشرة
        </p>
        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={handleBookAppointment}
            className="w-[164px] h-[40px] bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            احجز موعدك
          </button>
        </div>
      </div>
    </div>
  );
}