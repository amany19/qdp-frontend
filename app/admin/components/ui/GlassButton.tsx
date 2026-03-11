'use client';

import React from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
          color: '#000000',
          border: '1px solid rgba(217, 209, 190, 0.5)',
        };
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.8)',
          color: '#111827',
          border: '1px solid rgba(229, 231, 235, 0.5)',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#FFFFFF',
          border: '1px solid rgba(220, 38, 38, 0.5)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '8px 16px',
          fontSize: '14px',
        };
      case 'md':
        return {
          padding: '12px 24px',
          fontSize: '15px',
        };
      case 'lg':
        return {
          padding: '14px 32px',
          fontSize: '16px',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...variantStyles,
        ...sizeStyles,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '12px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        fontFamily: 'Tajawal, sans-serif',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      {children}
    </button>
  );
};
