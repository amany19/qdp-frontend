'use client';

import React from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

interface GlassTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  hoverable?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (key: string) => void;
  onSelectAll?: (selected: boolean) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function GlassTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  hoverable = true,
  selectedRows,
  onSelectRow,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: GlassTableProps<T>) {
  const hasSelection = selectedRows !== undefined && onSelectRow !== undefined;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  const handleSelectRow = (key: string) => {
    if (onSelectRow) {
      onSelectRow(key);
    }
  };

  const handleSort = (column: TableColumn<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 197, 176, 0.3)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '16px',
          fontFamily: 'Tajawal, sans-serif',
        }}
      >
        جاري التحميل...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 197, 176, 0.3)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '16px',
          fontFamily: 'Tajawal, sans-serif',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 197, 176, 0.3)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        fontFamily: 'Tajawal, sans-serif',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(0, 0, 0, 0.02)',
                borderBottom: '1px solid rgba(212, 197, 176, 0.3)',
              }}
            >
              {hasSelection && (
                <th
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    width: '50px',
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.size === data.length && data.length > 0}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#D4C5B0',
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '16px',
                    textAlign: column.align || 'right',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => column.sortable && handleSort(column)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: column.align === 'center' ? 'center' : column.align === 'left' ? 'flex-start' : 'flex-end',
                      gap: '8px',
                    }}
                  >
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span style={{ fontSize: '12px', color: '#D4C5B0' }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const rowKey = keyExtractor(item);
              const isSelected = selectedRows?.has(rowKey);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(item)}
                  style={{
                    borderBottom: index < data.length - 1 ? '1px solid rgba(212, 197, 176, 0.15)' : 'none',
                    background: isSelected
                      ? 'rgba(212, 197, 176, 0.15)'
                      : index % 2 === 0
                      ? 'transparent'
                      : 'rgba(0, 0, 0, 0.01)',
                    cursor: onRowClick && hoverable ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (hoverable) {
                      e.currentTarget.style.background = 'rgba(212, 197, 176, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hoverable) {
                      e.currentTarget.style.background = isSelected
                        ? 'rgba(212, 197, 176, 0.15)'
                        : index % 2 === 0
                        ? 'transparent'
                        : 'rgba(0, 0, 0, 0.01)';
                    }
                  }}
                >
                  {hasSelection && (
                    <td
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(rowKey);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowKey)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#D4C5B0',
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: '16px',
                        textAlign: column.align || 'right',
                        fontSize: '14px',
                        color: '#111827',
                      }}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key] !== undefined && item[column.key] !== null
                        ? String(item[column.key])
                        : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
