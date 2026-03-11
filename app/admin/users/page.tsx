'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GlassButton } from '../components/ui/GlassButton';
import { UserFilters, UserFilterValues } from '../components/filters/UserFilters';
import { UsersTable } from '../components/data-tables/UsersTable';
import { UserFormModal } from '../components/modals/UserFormModal';
import { adminUsersService, User } from '../services/adminUsersService';

export default function UsersListPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilterValues>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUsersService.getUsers(filters, page, limit);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (newFilters: UserFilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const headers = ['الاسم', 'الهاتف', 'البريد', 'النوع', 'الحالة', 'تاريخ الإنشاء'];
    const userTypeLabels: Record<string, string> = {
      resident: 'ساكن',
      user: 'عارض',
      admin: 'مسؤول',
      super_admin: 'مسؤول رئيسي',
    };

    const csvData = users.map(user => [
      user.fullName,
      user.phone,
      user.email || '-',
      userTypeLabels[user.userType],
      user.phoneVerified ? 'نشط' : 'غير نشط',
      new Date(user.createdAt).toLocaleDateString('ar-QA'),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        await adminUsersService.updateUser(editingUser._id, userData);
      } else {
        await adminUsersService.createUser(userData);
      }

      // Reload users list
      await loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error; // Let the modal handle the error
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(users.map(u => u._id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`هل أنت متأكد من تفعيل ${selectedUsers.size} مستخدم؟`)) return;

    try {
      setBulkActionLoading(true);
      const promises = Array.from(selectedUsers).map(userId =>
        adminUsersService.updateUserStatus(userId, 'active')
      );
      await Promise.all(promises);

      setSelectedUsers(new Set());
      await loadUsers();
    } catch (error) {
      console.error('Failed to activate users:', error);
      alert('حدث خطأ أثناء تفعيل المستخدمين');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`هل أنت متأكد من إلغاء تفعيل ${selectedUsers.size} مستخدم؟`)) return;

    try {
      setBulkActionLoading(true);
      const promises = Array.from(selectedUsers).map(userId =>
        adminUsersService.updateUserStatus(userId, 'inactive')
      );
      await Promise.all(promises);

      setSelectedUsers(new Set());
      await loadUsers();
    } catch (error) {
      console.error('Failed to deactivate users:', error);
      alert('حدث خطأ أثناء إلغاء تفعيل المستخدمين');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`هل أنت متأكد من حذف ${selectedUsers.size} مستخدم؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;

    try {
      setBulkActionLoading(true);
      const promises = Array.from(selectedUsers).map(userId =>
        adminUsersService.deleteUser(userId)
      );
      await Promise.all(promises);

      setSelectedUsers(new Set());
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('حدث خطأ أثناء حذف المستخدمين');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleVerifyPhone = async (userId: string) => {
    try {
      await adminUsersService.verifyPhone(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to verify phone:', error);
      alert('حدث خطأ أثناء توثيق الهاتف');
    }
  };

  const handleUnverifyPhone = async (userId: string) => {
    try {
      await adminUsersService.unverifyPhone(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to unverify phone:', error);
      alert('حدث خطأ أثناء إلغاء توثيق الهاتف');
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      await adminUsersService.verifyEmail(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to verify email:', error);
      alert('حدث خطأ أثناء توثيق البريد الإلكتروني');
    }
  };

  const handleUnverifyEmail = async (userId: string) => {
    try {
      await adminUsersService.unverifyEmail(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to unverify email:', error);
      alert('حدث خطأ أثناء إلغاء توثيق البريد الإلكتروني');
    }
  };

  return (
    <div style={{ padding: '32px', fontFamily: 'Tajawal, sans-serif' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            إدارة المستخدمين
          </h1>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
            إجمالي المستخدمين: {total.toLocaleString('ar-QA')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <GlassButton variant="secondary" onClick={handleExportCSV}>
            تصدير CSV
          </GlassButton>
          <GlassButton onClick={handleAddUser}>
            + إضافة مستخدم
          </GlassButton>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '16px 24px',
            background: 'rgba(212, 197, 176, 0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 197, 176, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
            تم تحديد {selectedUsers.size} مستخدم
          </span>

          <div style={{ display: 'flex', gap: '12px' }}>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleBulkActivate}
              disabled={bulkActionLoading}
            >
              ✓ تفعيل
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleBulkDeactivate}
              disabled={bulkActionLoading}
            >
              ⊘ إلغاء التفعيل
            </GlassButton>
            <GlassButton
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
            >
              ✕ حذف
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setSelectedUsers(new Set())}
              disabled={bulkActionLoading}
            >
              إلغاء التحديد
            </GlassButton>
          </div>
        </div>
      )}

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        onEditUser={handleEditUser}
        selectedRows={selectedUsers}
        onSelectRow={handleSelectUser}
        onSelectAll={handleSelectAll}
        onVerifyPhone={handleVerifyPhone}
        onUnverifyPhone={handleUnverifyPhone}
        onVerifyEmail={handleVerifyEmail}
        onUnverifyEmail={handleUnverifyEmail}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <GlassButton
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </GlassButton>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number;

              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  style={{
                    padding: '8px 14px',
                    background: page === pageNumber
                      ? 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: page === pageNumber
                      ? '1px solid rgba(212, 197, 176, 0.5)'
                      : '1px solid rgba(212, 197, 176, 0.3)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: page === pageNumber ? '#000' : '#6B7280',
                    cursor: 'pointer',
                    fontFamily: 'Tajawal, sans-serif',
                    minWidth: '40px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (page !== pageNumber) {
                      e.currentTarget.style.background = 'rgba(212, 197, 176, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== pageNumber) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                    }
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            التالي
          </GlassButton>
        </div>
      )}

      {/* Stats Footer */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 197, 176, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: '#6B7280',
        }}
      >
        <span>
          عرض {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} من {total} مستخدم
        </span>
        <span>
          الصفحة {page} من {totalPages}
        </span>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitUser}
        user={editingUser}
        mode={editingUser ? 'edit' : 'create'}
      />
    </div>
  );
}
