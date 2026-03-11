'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DangerSection() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="p-4 space-y-3 bg-white">
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 rounded-xl bg-white rounded-[10px] border border-gray-200 p-[10px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        تسجيل خروج
      </button>

      <button className="w-full py-3 rounded-xl bg-red-100 text-red-600 flex items-center justify-center gap-2">
        <Trash2 className="w-4 h-4" />
        حذف حساب
      </button>
    </div>
  )
}