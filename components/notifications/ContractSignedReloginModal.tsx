'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOnNotification } from '@/components/providers/NotificationSocketProvider';

const CONTRACT_SIGNED_TYPE = 'contract_signed_by_admin';

export default function ContractSignedReloginModal() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  useOnNotification((payload: { type?: string }) => {
    if (payload?.type === CONTRACT_SIGNED_TYPE) {
      setOpen(true);
    }
  });

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push('/auth/login');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-2xl">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            تم توقيع العقد من قبل الإدارة
          </h2>
          <p className="text-gray-600 text-sm">
            تم تفعيل حسابك كساكن. يرجى تسجيل الخروج والدخول مرة أخرى لاستخدام حساب الساكن.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          تسجيل الخروج والدخول مرة أخرى
        </button>
      </div>
    </div>
  );
}
