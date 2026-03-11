'use client';

import React, { useState } from 'react';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { GlassChip } from '../ui/GlassChip';

export interface UserFilterValues {
  search?: string;
  userType?: string;
  status?: string;
  verified?: string;
  startDate?: string;
  endDate?: string;
}

interface UserFiltersProps {
  filters: UserFilterValues;
  onFilterChange: (filters: UserFilterValues) => void;
  onClearFilters: () => void;
}

const userTypeOptions = [
  { value: '', label: 'الكل' },
  { value: 'resident', label: 'ساكن' },
  { value: 'user', label: 'عارض' },
  // { value: 'agent', label: 'وكيل' },
  { value: 'admin', label: 'مسؤول' },
  { value: 'super_admin', label: 'مسؤول رئيسي' },
];

const statusOptions = [
  { value: '', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'suspended', label: 'موقوف' },
];

const verifiedOptions = [
  { value: '', label: 'الكل' },
  { value: 'true', label: 'موثق' },
  { value: 'false', label: 'غير موثق' },
];

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (key: keyof UserFilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value && value !== '').length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const selectStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(212, 197, 176, 0.4)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'Tajawal, sans-serif',
    direction: 'rtl',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 197, 176, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        fontFamily: 'Tajawal, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>
            الفلاتر
          </h3>
          {activeFiltersCount > 0 && (
            <GlassChip
              label={`${activeFiltersCount} فلتر نشط`}
              variant="info"
              size="sm"
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {activeFiltersCount > 0 && (
            <GlassButton variant="secondary" size="sm" onClick={onClearFilters}>
              مسح الفلاتر
            </GlassButton>
          )}
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'إخفاء' : 'إظهار الفلاتر'}
          </GlassButton>
        </div>
      </div>

      {/* Search - Always Visible */}
      <div style={{ marginBottom: isExpanded ? '16px' : '0' }}>
        <GlassInput
          type="search"
          placeholder="ابحث بالاسم، الهاتف، البريد، أو رقم الهوية..."
          value={filters.search || ''}
          onChange={(value) => handleInputChange('search', value)}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(212, 197, 176, 0.2)' }}>
          {/* User Type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                textAlign: 'right',
              }}
            >
              نوع المستخدم
            </label>
            <select
              value={filters.userType || ''}
              onChange={(e) => handleInputChange('userType', e.target.value)}
              style={selectStyles}
            >
              {userTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                textAlign: 'right',
              }}
            >
              الحالة
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={selectStyles}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                textAlign: 'right',
              }}
            >
              التوثيق
            </label>
            <select
              value={filters.verified || ''}
              onChange={(e) => handleInputChange('verified', e.target.value)}
              style={selectStyles}
            >
              {verifiedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  textAlign: 'right',
                }}
              >
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                style={{
                  ...selectStyles,
                  paddingLeft: '12px',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  textAlign: 'right',
                }}
              >
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                style={{
                  ...selectStyles,
                  paddingLeft: '12px',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
