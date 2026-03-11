'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-5" dir="rtl">
      {/* 404 Illustration */}
      <div className="mb-8">
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
          <div className="text-[120px] font-bold text-[#E6E6E6]">404</div>
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">الصفحة غير موجودة</h1>
        <p className="text-[#666666] text-base mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/home')}
            className="w-full py-3 rounded-lg bg-[#1A1A1A] text-[#F3F1EB] font-bold text-base"
            style={{ boxShadow: "0px 1px 2px #1018280D" }}
          >
            العودة للرئيسية
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-lg border border-[#E6E6E6] text-[#666666] font-medium text-base"
          >
            الرجوع للخلف
          </button>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="fixed bottom-6">
        <div className="bg-[#344054D9] w-[139px] h-[5px] rounded-sm"></div>
      </div>
    </div>
  );
}
