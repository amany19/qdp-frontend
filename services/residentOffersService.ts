import { api } from './api';
import type { ResidentOffer } from '@/types/residentOffer';

export const residentOffersService = {
  /**
   * Get all active resident offers (partner discounts).
   * Requires resident role; returns 403 for non-residents.
   */
  async getAll(): Promise<ResidentOffer[]> {
    const response = await api.get<ResidentOffer[]>('/resident-offers');
    return response.data ?? [];
  },
};
