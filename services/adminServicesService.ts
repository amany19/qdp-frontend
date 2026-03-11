import axios from 'axios';
import { API_BASE_URL, SERVER_BASE_URL } from '@/lib/config';

// Use SERVER_BASE_URL (without /api) for this service
const API_URL = SERVER_BASE_URL;

export interface Service {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  propertyId?: {
    _id: string;
    title: string;
    location: string;
  };
  serviceType: 'furniture' | 'plumbing' | 'electrical' | 'ac';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestDate: Date;
  scheduledDate?: Date;
  completionDate?: Date;
  technicianId?: {
    _id: string;
    nameAr: string;
    nameEn: string;
    phone: string;
    specialization: string;
    status: string;
    averageRating?: number;
  };
  technicianName?: string;
  cost?: number;
  estimatedCost?: number;
  images?: string[];
  rating?: number;
  feedback?: string;
  isPaid: boolean;
}

export interface Technician {
  _id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  email?: string;
  specialization: 'furniture' | 'plumbing' | 'electrical' | 'ac' | 'other';
  customSpecialization?: string;
  idNumber?: string;
  yearsOfExperience: number;
  profileImage?: string;
  skills: string[];
  status: 'active' | 'inactive' | 'busy';
  totalJobs: number;
  completedJobs: number;
  currentJobs: number;
  averageRating: number;
}

export interface Appointment {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    phone: string;
  };
  propertyId: {
    _id: string;
    title: string;
    location: string;
  };
  appointmentType: 'viewing' | 'delivery';
  appointmentDate: Date;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  agentId?: {
    _id: string;
    fullName: string;
    phone: string;
  };
  notes?: string;
}

export class AdminServicesService {
  private getAuthHeader() {
    const token = localStorage.getItem('admin-token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // ========== SERVICES ==========
  async getServices(filters?: {
    serviceType?: string;
    status?: string;
    technicianId?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get<{
      services: Service[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${API_BASE_URL}/admin/services?${params.toString()}`, this.getAuthHeader());
    return response.data;
  }

  async getServiceStats() {
    const response = await axios.get(`${API_BASE_URL}/admin/services/stats`, this.getAuthHeader());
    return response.data;
  }

  async getService(id: string) {
    const response = await axios.get<Service>(
      `${API_BASE_URL}/admin/services/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async assignTechnician(
    serviceId: string,
    data: { technicianId: string; scheduledDate?: Date; notes?: string }
  ) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/services/${serviceId}/assign-technician`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async changeTechnician(serviceId: string, data: { technicianId: string; reason?: string }) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/services/${serviceId}/change-technician`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateServiceStatus(serviceId: string, data: { status: string; notes?: string }) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/services/${serviceId}/status`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateServiceCost(serviceId: string, data: { estimatedCost: number; notes?: string }) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/services/${serviceId}/cost`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async completeService(serviceId: string, data: { finalCost: number; notes?: string }) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/services/${serviceId}/complete`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  // ========== TECHNICIANS ==========
  async getTechnicians(filters?: {
    specialization?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get<{
      technicians: Technician[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${API_BASE_URL}/admin/technicians?${params.toString()}`, this.getAuthHeader());
    return response.data;
  }

  async getTechnicianStats() {
    const response = await axios.get(
      `${API_BASE_URL}/admin/technicians/stats`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getAvailableTechnicians(specialization: string) {
    const response = await axios.get<Technician[]>(
      `${API_BASE_URL}/admin/technicians/available/${specialization}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async createTechnician(data: Partial<Technician>) {
    const response = await axios.post(`${API_BASE_URL}/admin/technicians`, data, this.getAuthHeader());
    return response.data;
  }

  async updateTechnician(id: string, data: Partial<Technician>) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/technicians/${id}`,
      data,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateTechnicianStatus(id: string, status: string) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/technicians/${id}/status`,
      { status },
      this.getAuthHeader()
    );
    return response.data;
  }

  async deleteTechnician(id: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/technicians/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // ========== APPOINTMENTS ==========
  async getAppointments(filters?: {
    appointmentType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.appointmentType) params.append('appointmentType', filters.appointmentType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get<{
      appointments: Appointment[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${API_BASE_URL}/admin/appointments?${params.toString()}`, this.getAuthHeader());
    return response.data;
  }

  async getAppointmentStats() {
    const response = await axios.get(
      `${API_BASE_URL}/admin/appointments/stats`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async updateAppointmentStatus(id: string, status: string) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/appointments/${id}/status`,
      { status },
      this.getAuthHeader()
    );
    return response.data;
  }

  async assignAgent(id: string, agentId: string) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/appointments/${id}/assign-agent`,
      { agentId },
      this.getAuthHeader()
    );
    return response.data;
  }

  async deleteAppointment(id: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/appointments/${id}`,
      this.getAuthHeader()
    );
    return response.data;
  }
}

export const adminServicesService = new AdminServicesService();
