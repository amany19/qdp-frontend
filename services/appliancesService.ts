import { API_BASE_URL } from '@/lib/config';

const API_URL = API_BASE_URL;

export interface Appliance {
  _id: string;
  nameEn: string;
  nameAr: string;
  applianceType: string;
  brand: string;
  model?: string;
  color?: string;
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  rentalPrices: {
    oneMonth: number;
    sixMonths: number;
    oneYear: number;
  };
  isAvailable: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplianceBooking {
  _id: string;
  applianceId: string | Appliance;
  userId: string;
  rentalDuration: '1_month' | '6_months' | '1_year';
  startDate: string;
  endDate: string;
  timeSlot: string;
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  rentalDuration: '1_month' | '6_months' | '1_year';
  startDate: string;
  timeSlot: string;
  notes?: string;
}

// Get all appliances with optional filters
export async function getAppliances(params?: {
  applianceType?: string;
  brand?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.applianceType) queryParams.append('applianceType', params.applianceType);
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.search) queryParams.append('search', params.search);

  const url = `${API_URL}/appliances${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch appliances');
  return response.json() as Promise<Appliance[]>;
}

// Get single appliance by ID
export async function getApplianceById(id: string) {
  const response = await fetch(`${API_URL}/appliances/${id}`);
  if (!response.ok) throw new Error('Failed to fetch appliance');
  return response.json() as Promise<Appliance>;
}

// Increment appliance view count
export async function incrementApplianceView(id: string) {
  const response = await fetch(`${API_URL}/appliances/${id}/view`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to increment view count');
}

// Book an appliance (requires authentication)
export async function bookAppliance(
  applianceId: string,
  bookingData: CreateBookingDto,
  token: string
) {
  const response = await fetch(`${API_URL}/appliances/${applianceId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to book appliance');
  }

  return response.json() as Promise<ApplianceBooking>;
}

// Get user's appliance bookings (requires authentication)
export async function getUserBookings(token: string) {
  const response = await fetch(`${API_URL}/appliances/bookings/my-bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch user bookings');
  return response.json() as Promise<ApplianceBooking[]>;
}

// Get booking by ID (requires authentication)
export async function getBookingById(bookingId: string, token: string) {
  const response = await fetch(`${API_URL}/appliances/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch booking');
  return response.json() as Promise<ApplianceBooking>;
}

// Cancel a booking (requires authentication)
export async function cancelBooking(
  bookingId: string,
  reason: string,
  token: string
) {
  const response = await fetch(`${API_URL}/appliances/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel booking');
  }

  return response.json() as Promise<ApplianceBooking>;
}

// Helper function to get rental duration label in Arabic
export function getRentalDurationLabel(duration: string): string {
  switch (duration) {
    case '1_month':
      return 'شهر';
    case '6_months':
      return '6 شهور';
    case '1_year':
      return 'سنة';
    default:
      return duration;
  }
}

// Create appliance (user advertisement - requires auth)
export async function createAppliance(
  data: {
    nameEn: string;
    nameAr: string;
    applianceType: string;
    brand: string;
    model?: string;
    color?: string;
    descriptionEn: string;
    descriptionAr: string;
    images?: string[];
    rentalPrices: { oneMonth: number; sixMonths: number; oneYear: number };
    deposit?: number;
    minRentalMonths?: number;
    maxRentalMonths?: number;
    ownerId?: string;
  },
  token: string
) {
  const response = await fetch(`${API_URL}/appliances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create appliance');
  }
  return response.json();
}

// Appliance listing (advertisement) - create and fees
export async function createApplianceListing(
  data: { applianceId: string; adDuration: string; evaluationFee?: number; displayFee?: number; totalCost?: number },
  token: string
) {
  const response = await fetch(`${API_URL}/appliance-listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create listing');
  }
  return response.json();
}

export async function calculateApplianceListingFee(adDuration: string) {
  const response = await fetch(`${API_URL}/appliance-listings/calculate-fee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adDuration }),
  });
  if (!response.ok) throw new Error('Failed to calculate fee');
  return response.json();
}

// Helper function to get appliance type label in Arabic
export function getApplianceTypeLabel(type: string): string {
  switch (type) {
    case 'refrigerator':
      return 'ثلاجة';
    case 'tv':
      return 'تلفزيون';
    case 'washing_machine':
      return 'غسالة';
    case 'ac':
      return 'مكيف';
    case 'oven':
      return 'فرن';
    case 'microwave':
      return 'ميكروويف';
    case 'dishwasher':
      return 'غسالة صحون';
    default:
      return type;
  }
}
