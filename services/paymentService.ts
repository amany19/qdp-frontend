import { api } from './api';

export interface ProcessPaymentDTO {
  amount: number;
  paymentMethod: 'mastercard' | 'visa' | 'apple_pay' | 'google_pay' | 'paypal' | 'card';
  paymentType: 'listing' | 'booking' | 'appliance_rental' | 'service' | 'contract';
  referenceId: string; // ID of the contract, listing, booking, or service
  promoCode?: string;
  insuranceFee?: number;
  cardDetails?: {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string; // MM
    expiryYear: string; // YY or YYYY
    cvv: string;
  };
  currency?: string;
}

export interface Payment {
  _id: string;
  userId: string;
  contractId?: string;
  listingId?: string;
  applianceBookingId?: string;
  serviceRequestId?: string;
  amount: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transactionId?: string;
  paymentGateway?: string;
  gatewayResponse?: Record<string, unknown>;
  description?: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  /**
   * Process a new payment
   */
  process: async (data: ProcessPaymentDTO): Promise<Payment> => {
    console.log('[PAYMENT SERVICE] Processing payment...', {
      amount: data.amount,
      paymentType: data.paymentType,
      paymentMethod: data.paymentMethod,
      referenceId: data.referenceId,
    });

    try {
      const response = await api.post('/payments/process', data);
      console.log('[PAYMENT SERVICE] Payment response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: unknown; status?: number } };
      console.error('[PAYMENT SERVICE] Payment error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw error;
    }
  },

  /**
   * Get payment by ID
   */
  findById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  /**
   * Get current user's payment history
   */
  getMyPayments: async (filters?: Record<string, string | number>): Promise<Payment[]> => {
    const response = await api.get('/payments/my-payments', { params: filters });
    return response.data;
  },

  /**
   * Request payment refund
   */
  refund: async (id: string, reason?: string): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/refund`, { reason });
    return response.data;
  },

  /**
   * Cancel pending payment
   */
  cancel: async (id: string): Promise<Payment> => {
    const response = await api.post(`/payments/${id}/cancel`);
    return response.data;
  },
};
