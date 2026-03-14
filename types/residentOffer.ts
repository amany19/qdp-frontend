import type { Partner } from './partner';

/** Populated partner from API (partnerId when populated) */
export type ResidentOfferPartner = Pick<Partner, '_id' | 'name' | 'logoUrl'> & { nameAr?: string };

export interface ResidentOffer {
  _id: string;
  /** When populated by API, this is the partner object with name, nameAr, logoUrl */
  partnerId: string | ResidentOfferPartner;
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

/** Partner display name from offer (API returns populated partnerId, not partner) */
export function getOfferPartnerName(offer: ResidentOffer): string {
  const p = offer.partner ?? (typeof offer.partnerId === 'object' && offer.partnerId ? offer.partnerId : null);
  if (!p) return '';
  return (p as ResidentOfferPartner).nameAr ?? (p as Partner).name ?? '';
}
