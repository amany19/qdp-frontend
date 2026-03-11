'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';

// Notification icon mapping
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment_confirmed':
      return (
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-[#F5E6D3]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
      );
    case 'payment_due':
      return (
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
          </svg>
        </div>
      );
    case 'property_match':
      return (
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
      );
    case 'service_completed':
      return (
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        </div>
      );
    case 'contract_expiring':
      return (
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        </div>
      );
    case 'message_received':
      return (
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </div>
      );
  }
};

// Format timestamp
const formatTimestamp = (date: Date) => {
  const notifDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 30) return `منذ ${diffDays} يوم`;

  return notifDate.toLocaleDateString('ar-QA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Notification Card Component
const NotificationCard = ({
  notification,
  isUnread,
  onTap,
}: {
  notification: Notification;
  isUnread: boolean;
  onTap: () => void;
}) => {
  return (
    <div
      onClick={onTap}
      className={`relative p-4 rounded-xl mb-2 cursor-pointer transition-all ${
        isUnread
          ? 'bg-[#F0F9FF] border-r-4 border-blue-500'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex gap-3 items-start" dir="rtl">
        {/* Icon/Avatar */}
        {getNotificationIcon(notification.type)}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-bold text-black mb-1 text-right">
            {notification.title}
          </h3>

          {/* Message */}
          <p className="text-[13px] text-gray-600 leading-relaxed mb-2 text-right line-clamp-3">
            {notification.message}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 text-right">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>

        {/* Unread Indicator */}
        {isUnread && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Separate read and unread notifications
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleNotificationTap = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between" dir="rtl">
          <h1 className="text-xl font-bold text-black">الاشعارات</h1>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* New Notifications Section */}
        {unreadCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3" dir="rtl">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-black">
                  الاشعارات الجديدة
                </h2>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-xl">
                  {unreadCount} اشعارات غير مقروءة
                </span>
              </div>
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-gray-600 hover:text-black transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            </div>

            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                isUnread={true}
                onTap={() => handleNotificationTap(notification)}
              />
            ))}
          </div>
        )}

        {/* Previous Notifications Section */}
        {readNotifications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3" dir="rtl">
              <h2 className="text-base font-bold text-black">
                الاشعارات السابقة
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-xl">
                {readNotifications.length} اشعار مقروء
              </span>
            </div>

            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                isUnread={false}
                onTap={() => handleNotificationTap(notification)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              لا توجد اشعارات
            </h3>
            <p className="text-gray-500 text-sm">
              ستظهر اشعاراتك هنا عندما تصلك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
