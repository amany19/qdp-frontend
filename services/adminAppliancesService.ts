import { api } from './api';

const ADMIN_APPLIANCES_URL = '/admin/appliances';

export interface Appliance {
  _id: string;
  nameEn: string;
  nameAr: string;
  applianceType: string;
  brand: string;
  model: string;
  color?: string;
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  rentalPrices: {
    oneMonth: number;
    sixMonths: number;
    oneYear: number;
  };
  monthlyPrice: number;
  deposit: number;
  minRentalMonths: number;
  maxRentalMonths: number;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  isAvailable: boolean;
  totalRentals: number;
  totalMonthsRented: number;
  lastMaintenanceDate?: Date;
  lastRentalDate?: Date;
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplianceRental {
  _id: string;
  applianceId: Appliance;
  userId: string | { _id: string; fullName: string; phone: string };
  durationMonths: number;
  monthlyAmount: number;
  totalAmount: number;
  deposit: number;
  installments: Array<{
    installmentNumber: number;
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    paymentMethod: 'card' | 'cash';
    paidAt?: Date;
    paidAmount?: number;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  deliveryAddress?: string;
  approvedBy?: string | { _id: string; fullName: string };
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const adminAppliancesService = {
  // ========== إدارة الأجهزة (Appliances Management) ==========

  async getAllAppliances(filters?: Record<string, string | number | boolean>) {
    const response = await api.get(ADMIN_APPLIANCES_URL, { params: filters });
    return response.data;
  },

  async getAppliancesStats() {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/stats`);
    return response.data;
  },

  async getApplianceDetails(id: string) {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/${id}`);
    return response.data;
  },

  async createAppliance(data: Partial<Appliance>) {
    const response = await api.post(ADMIN_APPLIANCES_URL, data);
    return response.data;
  },

  async updateAppliance(id: string, data: Partial<Appliance>) {
    const response = await api.put(`${ADMIN_APPLIANCES_URL}/${id}`, data);
    return response.data;
  },

  async deleteAppliance(id: string) {
    const response = await api.delete(`${ADMIN_APPLIANCES_URL}/${id}`);
    return response.data;
  },

  async setMaintenance(id: string, data: { maintenanceNotes: string; expectedReturnDate?: Date }) {
    const response = await api.put(`${ADMIN_APPLIANCES_URL}/${id}/maintenance`, data);
    return response.data;
  },

  async getRentalHistory(id: string, query?: Record<string, string | number | boolean>) {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/${id}/rental-history`, { params: query });
    return response.data;
  },

  // ========== طلبات التأجير (Rental Requests) ==========

  async getRentalRequests(filters?: Record<string, string | number | boolean>) {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/rental-requests/all`, { params: filters });
    return response.data;
  },

  async getRentalRequest(id: string) {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/rental-requests/${id}`);
    return response.data;
  },

  async approveRental(id: string, data: { deliveryAddress?: string; expectedDeliveryDate?: Date }) {
    const response = await api.put(`${ADMIN_APPLIANCES_URL}/rental-requests/${id}/approve`, data);
    return response.data;
  },

  async rejectRental(id: string, reason: string) {
    const response = await api.put(`${ADMIN_APPLIANCES_URL}/rental-requests/${id}/reject`, { reason });
    return response.data;
  },

  // ========== إدارة أقساط الأجهزة (Installments Management) ==========

  async getInstallments(rentalId: string) {
    const response = await api.get(`${ADMIN_APPLIANCES_URL}/rental-requests/${rentalId}/installments`);
    return response.data;
  },

  async updateInstallment(rentalId: string, installmentNumber: number, data: { paymentMethod: 'card' | 'cash' }) {
    const response = await api.put(
      `${ADMIN_APPLIANCES_URL}/rental-requests/${rentalId}/installments/${installmentNumber}`,
      data
    );
    return response.data;
  },

  async markInstallmentPaid(rentalId: string, installmentNumber: number, data: { paidAmount: number; paidAt: Date; notes?: string }) {
    const response = await api.put(
      `${ADMIN_APPLIANCES_URL}/rental-requests/${rentalId}/installments/${installmentNumber}/mark-paid`,
      data
    );
    return response.data;
  },
};
