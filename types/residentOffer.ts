import type { Partner } from './partner';

export interface ResidentOffer {
  _id: string;
  partnerId: string;
  partner?: Partner;
  title: string;
  description?: string;
  discountText: string;
  validUntil?: string;
  actionUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
