'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, User } from 'lucide-react';

export type StatusBadgeVariant =
  | 'confirmed' // مؤكد (green)
  | 'received' // استلم (gray)
  | 'in-progress' // جاري التنفيذ (red/pink)
  | 'agent' // وكيل العقارات (white with border)
  | 'unconfirmed' // غير مؤكد (yellow/orange)
  | 'completed' // مكتمل (green)
  | 'cancelled' // ملغي (red)
  | 'pending'; // قيد الانتظار (yellow)

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  // Variant styles
  const variantStyles: Record<
    StatusBadgeVariant,
    { bg: string; text: string; border?: string; icon?: React.ReactNode }
  > = {
    confirmed: {
      bg: 'bg-green-50',
      text: 'text-success-500',
      icon: showIcon ? <CheckCircle className="w-4 h-4" /> : undefined,
    },
    received: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: showIcon ? <CheckCircle className="w-4 h-4" /> : undefined,
    },
    'in-progress': {
      bg: 'bg-red-50',
      text: 'text-error-500',
      icon: showIcon ? <Clock className="w-4 h-4" /> : undefined,
    },
    agent: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border border-gray-200',
      icon: showIcon ? <User className="w-4 h-4" /> : undefined,
    },
    unconfirmed: {
      bg: 'bg-yellow-50',
      text: 'text-warning-500',
      icon: showIcon ? <AlertTriangle className="w-4 h-4" /> : undefined,
    },
    completed: {
      bg: 'bg-green-50',
      text: 'text-success-500',
      icon: showIcon ? <CheckCircle className="w-4 h-4" /> : undefined,
    },
    cancelled: {
      bg: 'bg-red-50',
      text: 'text-error-500',
      icon: showIcon ? <XCircle className="w-4 h-4" /> : undefined,
    },
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-warning-500',
      icon: showIcon ? <Clock className="w-4 h-4" /> : undefined,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-2xl font-medium
        ${styles.bg} ${styles.text} ${styles.border || ''}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {styles.icon && <span className="flex-shrink-0">{styles.icon}</span>}
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;
