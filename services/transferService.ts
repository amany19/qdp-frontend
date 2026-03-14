import { api } from './api';

export type TransferType = 'replace_tenant' | 'property_transfer' | 'ownership_transfer';

export interface NewTenantOrOwnerInfo {
  fullName: string;
  phone: string;
  email: string;
  qatarId: string;
}

export interface PropertyTransferItem {
  _id: string;
  transferType?: TransferType;
  userId: string;
  currentPropertyId?: { _id: string; title?: string; location?: { area?: string; city?: string }; images?: Array<{ url: string }> };
  requestedPropertyId?: { _id: string; title?: string; location?: { area?: string; city?: string }; images?: Array<{ url: string }> };
  bookingId?: { _id: string };
  newTenantInfo?: NewTenantOrOwnerInfo;
  newOwnerInfo?: NewTenantOrOwnerInfo;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'awaiting_info';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

export const transferService = {
  getList(): Promise<PropertyTransferItem[]> {
    return api.get('/user/bookings/transfers/list').then((res) => (Array.isArray(res.data) ? res.data : []));
  },

  createReplaceTenant(bookingId: string, newTenantInfo: NewTenantOrOwnerInfo, reason: string) {
    return api.post<PropertyTransferItem>('/user/bookings/transfers/booking/create', {
      bookingId,
      newTenantInfo,
      reason,
    });
  },

  createPropertyTransfer(requestedPropertyId: string, reason: string) {
    return api.post<PropertyTransferItem>('/user/bookings/transfers/property/create', {
      requestedPropertyId,
      reason,
    });
  },

  createOwnershipTransfer(newOwnerInfo: NewTenantOrOwnerInfo, reason: string) {
    return api.post<PropertyTransferItem>('/user/bookings/transfers/ownership/create', {
      newOwnerInfo,
      reason,
    });
  },
};
