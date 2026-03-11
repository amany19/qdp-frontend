import { api } from './api';

export interface Appointment {
  _id: string;
  userId: string;
  propertyId: {
    _id: string;
    title: string;
    titleAr?: string;
    location: {
      city: string;
      country: string;
      address?: string;
    };
    images?: Array<{ url: string; isCover?: boolean }>;
    price?: number;
  } | null;
  agentId?: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  appointmentType: 'viewing' | 'delivery';
  date: Date | string;
  time: string;
  status: 'confirmed' | 'received' | 'in_progress' | 'agent' | 'unconfirmed';
  notes?: string;
  location?: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  reminderSent?: boolean;
  completedAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAppointmentDto {
  propertyId: string;
  appointmentType: 'viewing' | 'delivery';
  date: Date | string;
  time: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  date?: Date | string;
  time?: string;
  status?: string;
  notes?: string;
}

export interface AppointmentFilters {
  appointmentType?: 'viewing' | 'delivery';
  status?: string;
  from?: Date | string;
  to?: Date | string;
}

export const appointmentService = {
  /**
   * Get all appointments for current user with optional filters
   */
  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.appointmentType) params.append('appointmentType', filters.appointmentType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from.toString());
    if (filters?.to) params.append('to', filters.to.toString());

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  /**
   * Get appointments by type (viewing or delivery)
   */
  async getByType(type: 'viewing' | 'delivery'): Promise<Appointment[]> {
    const response = await api.get(`/appointments?appointmentType=${type}`);
    return response.data;
  },

  /**
   * Get a single appointment by ID
   */
  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Create a new appointment
   */
  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  /**
   * Update an appointment
   */
  async update(id: string, data: UpdateAppointmentDto): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  async cancel(id: string): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, { status: 'cancelled' });
    return response.data;
  },

  /**
   * Delete an appointment
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
