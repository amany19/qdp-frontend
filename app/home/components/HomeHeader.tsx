'use client';

import { useRouter } from 'next/navigation';

interface HomeHeaderProps {
  user: any;
  unreadCount: number;
  userLocation: string;
  isLoadingLocation: boolean;
}

export default function HomeHeader({
  user,
  unreadCount,
  userLocation,
  isLoadingLocation,
}: HomeHeaderProps) {
  const router = useRouter();

  return (
      <div className=" flex items-center justify-between  bg-white px-5 py-4 border-b border-gray-100 rounded-b-4xl shadow-sm mb-1">
        <div className="flex items-center gap-3">

          <div>
            <p className="text-md  py-1">أهلاً بك{user?.fullName ? ` ${user.fullName.split(' ')[0]}` : ''} !</p>
            <button
              onClick={() => {
                // In production, this would open location picker modal
                console.log('Open location picker');
              }}
              className="flex items-center gap-1 font-medium text-sm text-gray-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {isLoadingLocation ? 'جاري التحميل...' : userLocation}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => router.push('/notifications')}
              className="relative"
              aria-label="الاشعارات"
            >
              <div className="w-10 h-10 bg-[#F3F1EB] rounded-full flex items-center justify-center">
                <svg
                  className={`w-6 h-6 transition-transform ${unreadCount > 0 ? 'animate-bell-shake' : ''}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-badge-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="تسجيل الدخول"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
  );
}