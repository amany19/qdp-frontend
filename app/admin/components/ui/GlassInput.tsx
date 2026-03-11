'use client';

import React from 'react';

interface GlassInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'search';
  placeholder?: string;
  value: string | number;
  onChange: ((value: string) => void) | ((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void);
  name?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  dir?: 'rtl' | 'ltr';
  rows?: number;
  multiline?: boolean;
  maxLength?: number;
  style?: React.CSSProperties;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  label,
  error,
  required = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  className = '',
  dir = 'rtl',
  rows = 3,
  multiline = false,
  maxLength,
  style,
}) => {
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: icon ? (iconPosition === 'right' ? '12px 48px 12px 16px' : '12px 16px 12px 48px') : '12px 16px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: error ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(212, 197, 176, 0.4)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'Tajawal, sans-serif',
    direction: dir,
    boxSizing: 'border-box',
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
      background: 'rgba(0, 0, 0, 0.05)',
    }),
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = '1px solid rgba(212, 197, 176, 0.8)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 197, 176, 0.15)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.border = error ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(212, 197, 176, 0.4)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div className={className} style={{ marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}
        >
          {label}
          {required && <span style={{ color: '#EF4444', marginRight: '4px' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {multiline ? (
          <textarea
            name={name}
            value={value}
            onChange={(e) => {
              // Try calling with event first, fall back to value if it fails
              try {
                (onChange as any)(e);
              } catch (err) {
                (onChange as any)(e.target.value);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              ...inputStyles,
              resize: 'vertical',
              minHeight: '80px',
              ...style,
            }}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => {
              // Try calling with event first, fall back to value if it fails
              try {
                (onChange as any)(e);
              } catch (err) {
                (onChange as any)(e.target.value);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...inputStyles, ...style }}
          />
        )}

        {icon && (
          <div
            style={{
              position: 'absolute',
              top: multiline ? '16px' : '50%',
              transform: multiline ? 'none' : 'translateY(-50%)',
              [iconPosition === 'right' ? 'right' : 'left']: '16px',
              color: '#9CA3AF',
              pointerEvents: 'none',
              fontSize: '18px',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            fontSize: '12px',
            color: '#EF4444',
            marginTop: '6px',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}
        >
          {error}
        </div>
      )}

      {maxLength && (
        <div
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            marginTop: '4px',
            textAlign: dir === 'rtl' ? 'right' : 'left',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};
