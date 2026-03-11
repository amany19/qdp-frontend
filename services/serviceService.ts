import axios from 'axios';
import {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  RateServiceDto,
  ServiceFilters,
  ServiceStats
} from '@/types/service.types';
import { API_BASE_URL } from '@/lib/config';

const API_URL = API_BASE_URL;

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    console.log('Getting auth token:', token ? 'Token exists' : 'No token found');
    return token;
  }
  return null;
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Decode token to see user ID (for debugging)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload - User ID:', payload.sub, 'Phone:', payload.phone);
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  return config;
});

export const serviceService = {
  /**
   * Get all services for current user with optional filters
   */
  async getAll(filters?: ServiceFilters): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);

    const response = await api.get(`/services?${params.toString()}`);
    return response.data;
  },

  /**
   * Get current (ongoing) service requests
   */
  async getCurrent(): Promise<Service[]> {
    console.log('Calling GET /services/current');
    const response = await api.get('/services/current');
    console.log('Response from /services/current:', response.data);
    return response.data;
  },

  /**
   * Get previous (completed/cancelled) service requests
   */
  async getPrevious(): Promise<Service[]> {
    const response = await api.get('/services/previous');
    return response.data;
  },

  /**
   * Get service statistics
   */
  async getStats(): Promise<ServiceStats> {
    const response = await api.get('/services/stats');
    return response.data;
  },

  /**
   * Get a single service by ID
   */
  async getById(id: string): Promise<Service> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Create a new service request
   */
  async create(data: CreateServiceDto): Promise<Service> {
    console.log('Calling POST /services with data:', data);
    const response = await api.post('/services', data);
    console.log('Response from POST /services:', response.data);
    return response.data;
  },

  /**
   * Update a service request
   */
  async update(id: string, data: UpdateServiceDto): Promise<Service> {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Update service status
   */
  async updateStatus(id: string, status: string, data?: any): Promise<Service> {
    const response = await api.put(`/services/${id}/status`, { status, ...data });
    return response.data;
  },

  /**
   * Assign a technician to a service
   */
  async assignTechnician(id: string, technicianId: string, scheduledDate: Date): Promise<Service> {
    const response = await api.put(`/services/${id}/assign`, {
      technicianId,
      scheduledDate,
    });
    return response.data;
  },

  /**
   * Rate a completed service
   */
  async rate(id: string, data: RateServiceDto): Promise<Service> {
    const response = await api.put(`/services/${id}/rate`, data);
    return response.data;
  },

  /**
   * Delete a service request
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
