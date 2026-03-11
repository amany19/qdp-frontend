import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

const API_URL = `${API_BASE_URL}/admin/users`;

export interface User {
  _id: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  userType: 'resident' | 'user' | 'admin' | 'super_admin';
  phoneVerified: boolean;
  emailVerified: boolean;
  languagePreference: 'ar' | 'en';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  properties: number;
  appointments: number;
  contracts: number;
  totalSpent: number;
}

export interface UserFilterValues {
  search?: string;
  userType?: string;
  status?: string;
  verified?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin-token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminUsersService = {
  async getUsers(
    filters: UserFilterValues,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; pagination: PaginationData }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.verified) params.append('phoneVerified', filters.verified);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getUser(userId: string): Promise<User> {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getUserStats(userId: string): Promise<{ stats: UserStats }> {
    const response = await axios.get(`${API_URL}/${userId}/stats`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async getUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    const response = await axios.get(`${API_URL}/${userId}/activity?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await axios.post(API_URL, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await axios.put(`${API_URL}/${userId}`, userData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/${userId}/status`,
      { status },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await axios.delete(`${API_URL}/${userId}`, {
      headers: getAuthHeaders(),
    });
  },

  async verifyPhone(userId: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/${userId}/verify-phone`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async unverifyPhone(userId: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/${userId}/unverify-phone`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async verifyEmail(userId: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/${userId}/verify-email`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  async unverifyEmail(userId: string): Promise<User> {
    const response = await axios.put(
      `${API_URL}/${userId}/unverify-email`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};
