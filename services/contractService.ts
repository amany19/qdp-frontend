import { api } from './api';

export interface CreateContractDTO {
  propertyId: string;
  tenantId: string; // buyer for sale, tenant for rent
  landlordId: string; // seller for sale, landlord for rent
  contractType: 'rent' | 'sale';
  startDate: string | Date; // Accept both formats
  endDate?: string | Date; // Required for rental contracts
  amount: number; // Monthly rent or total sale price
  advancePayment?: number;
  numberOfChecks?: number; // For rental contracts
  insuranceAmount?: number; // Security deposit
  loyaltyBonus?: boolean; // مكافأة الالتزام
  allowUnitTransfer?: boolean; // تغيير المجمع السكني
}

export interface SignContractDTO {
  signature: string; // Base64 or signature data
  signerRole: 'tenant' | 'landlord'; // Who is signing
}

export interface CancelContractDTO {
  reason: string;
}

export interface Contract {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    titleAr: string;
    images: Array<{ url: string; isCover: boolean }>;
    location: {
      address: string;
      city: string;
      area: string;
    };
    price: number;
  };
  tenantId: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  landlordId: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  contractType: 'rent' | 'sale';
  startDate: string;
  endDate?: string;
  amount: number;
  advancePayment?: number;
  terms: string[];
  numberOfChecks?: number;
  checkSchedule?: {
    frequency: string;
    count: number;
    firstCheckDate: string;
  };
  insuranceAmount?: number;
  penaltyAmount?: number;
  electronicSignatureTenant?: string;
  electronicSignatureLandlord?: string;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'cancelled' | 'terminated';
  signedAtTenant?: string;
  signedAtLandlord?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const contractService = {
  /**
   * Create a new contract (draft)
   */
  create: async (data: CreateContractDTO): Promise<Contract> => {
    const response = await api.post('/contracts', data);
    return response.data;
  },

  /**
   * Get contract by ID
   */
  findOne: async (id: string): Promise<Contract> => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  /**
   * Get current user's contracts
   */
  getMyContracts: async (): Promise<Contract[]> => {
    const response = await api.get('/contracts/my-contracts');
    return response.data;
  },

  /**
   * Get contracts by property ID
   */
  getByProperty: async (propertyId: string): Promise<Contract[]> => {
    const response = await api.get(`/contracts/property/${propertyId}`);
    return response.data;
  },

  /**
   * Sign contract with electronic signature
   */
  sign: async (contractId: string, signDto: SignContractDTO): Promise<Contract> => {
    const response = await api.put(`/contracts/${contractId}/sign`, signDto);
    return response.data;
  },

  /**
   * Request contract cancellation
   */
  requestCancellation: async (contractId: string, cancelDto: CancelContractDTO): Promise<Contract> => {
    const response = await api.post(`/contracts/${contractId}/cancel`, cancelDto);
    return response.data;
  },

  /**
   * Approve or reject contract cancellation
   */
  approveCancellation: async (contractId: string, approved: boolean): Promise<Contract> => {
    const response = await api.put(`/contracts/${contractId}/approve-cancel`, { approved });
    return response.data;
  },

  /**
   * Update contract status
   */
  updateStatus: async (contractId: string, status: string): Promise<Contract> => {
    const response = await api.put(`/contracts/${contractId}/status`, { status });
    return response.data;
  },

  /**
   * Delete contract (only drafts)
   */
  delete: async (contractId: string): Promise<void> => {
    await api.delete(`/contracts/${contractId}`);
  },

  /**
   * Get contract statistics
   */
  getStatistics: async (): Promise<any> => {
    const response = await api.get('/contracts/statistics');
    return response.data;
  },
};
