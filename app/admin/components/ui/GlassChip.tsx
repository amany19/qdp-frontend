'use client';

import React from 'react';

export type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface GlassChipProps {
  label: string;
  variant?: ChipVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const GlassChip: React.FC<GlassChipProps> = ({
  label,
  variant = 'default',
  size = 'md',
  icon,
  onRemove,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#D97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#DC2626',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'info':
        return {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#2563EB',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        };
      default:
        return {
          background: 'rgba(212, 197, 176, 0.15)',
          color: '#6B5B3C',
          border: '1px solid rgba(212, 197, 176, 0.3)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '4px 12px',
          fontSize: '12px',
          gap: '4px',
        };
      case 'md':
        return {
          padding: '6px 16px',
          fontSize: '14px',
          gap: '6px',
        };
      case 'lg':
        return {
          padding: '8px 20px',
          fontSize: '15px',
          gap: '8px',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...variantStyles,
        ...sizeStyles,
        borderRadius: '20px',
        fontWeight: 600,
        fontFamily: 'Tajawal, sans-serif',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0',
            marginRight: '-4px',
            marginLeft: '4px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
