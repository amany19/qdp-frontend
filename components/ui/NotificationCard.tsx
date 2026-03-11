'use client';

import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Bell, CheckCircle, CreditCard, Home, Wrench, Calendar, MessageCircle } from 'lucide-react';

export type NotificationType =
  | 'appointment_confirmed'
  | 'payment_due'
  | 'property_match'
  | 'service_completed'
  | 'contract_expiring'
  | 'message_received'
  | 'general';

interface NotificationCardProps {
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    actionText?: string;
    actionLink?: string;
    timestamp: Date | string;
    isRead: boolean;
    imageUrl?: string;
    avatar?: string;
  };
  onTap?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  locale?: 'ar' | 'en';
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onTap,
  onMarkAsRead,
  locale = 'ar',
}) => {
  const getIcon = (type: NotificationType) => {
    const iconClass = 'w-5 h-5 text-white';

    switch (type) {
      case 'appointment_confirmed':
        return { icon: <CheckCircle className={iconClass} />, bgColor: 'bg-success-500' };
      case 'payment_due':
        return { icon: <CreditCard className={iconClass} />, bgColor: 'bg-error-500' };
      case 'property_match':
        return { icon: <Home className={iconClass} />, bgColor: 'bg-primary-500' };
      case 'service_completed':
        return { icon: <Wrench className={iconClass} />, bgColor: 'bg-success-500' };
      case 'contract_expiring':
        return { icon: <Calendar className={iconClass} />, bgColor: 'bg-warning-500' };
      case 'message_received':
        return { icon: <MessageCircle className={iconClass} />, bgColor: 'bg-primary-500' };
      default:
        return { icon: <Bell className={iconClass} />, bgColor: 'bg-gray-500' };
    }
  };

  const { icon, bgColor } = getIcon(notification.type);

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onTap) {
      onTap(notification.id);
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true, locale: locale === 'ar' ? ar : undefined });
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200
        ${
          notification.isRead
            ? 'bg-white hover:bg-gray-50'
            : 'bg-blue-50 hover:bg-blue-100 border-r-4 border-blue-500'
        }
      `}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Icon/Avatar */}
      <div className="flex-shrink-0">
        {notification.imageUrl || notification.avatar ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={notification.imageUrl || notification.avatar || ''}
              alt={notification.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
          {notification.title}
        </h3>

        {/* Body */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-3 leading-relaxed">
          {notification.body}
          {notification.actionText && notification.actionLink && (
            <span className="inline-block ml-1">
              <a
                href={notification.actionLink}
                className="text-gray-900 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.actionText}
              </a>
            </span>
          )}
        </p>

        {/* Timestamp */}
        <p className="text-xs text-gray-400">
          {formatTimestamp(notification.timestamp)}
        </p>
      </div>

      {/* Unread Indicator Dot */}
      {!notification.isRead && (
        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );
};

export default NotificationCard;
