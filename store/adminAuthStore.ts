import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminPermissions {
  users?: { view?: boolean; create?: boolean; edit?: boolean; delete?: boolean };
  properties?: { view?: boolean; approve?: boolean; edit?: boolean; delete?: boolean };
  appointments?: { view?: boolean; manage?: boolean };
  payments?: { view?: boolean; refund?: boolean };
  analytics?: { view?: boolean; export?: boolean };
  settings?: { view?: boolean; edit?: boolean };
}

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  userType: 'admin' | 'super_admin';
  adminPermissions: AdminPermissions;
  profilePicture?: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  hasPermission: (module: keyof AdminPermissions, action: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (token: string, admin: AdminUser) => {
        set({
          token,
          admin,
          isAuthenticated: true,
        });

        // Also store in localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin-token', token);
          localStorage.setItem('admin-user', JSON.stringify(admin));
        }
      },

      logout: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
        });

        // Clear localStorage on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
          localStorage.removeItem('admin-auth-storage');
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      hasPermission: (module: keyof AdminPermissions, action: string) => {
        const { admin } = get();

        if (!admin) return false;

        // Super admin has all permissions
        if (admin.userType === 'super_admin') return true;

        // Check specific permission
        const modulePermissions = admin.adminPermissions?.[module];
        if (!modulePermissions) return false;

        return modulePermissions[action as keyof typeof modulePermissions] === true;
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
