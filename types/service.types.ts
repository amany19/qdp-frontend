export type ServiceType = 'furniture' | 'plumbing' | 'electrical' | 'ac';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Service {
  _id: string;
  userId: string;
  propertyId?: {
    _id: string;
    title: string;
    description: string;
    location: {
      address: string;
      city: string;
      area: string;
    };
    images: Array<{
      url: string;
      isCover: boolean;
      order: number;
    }>;
  };
  serviceType: ServiceType;
  title: string;
  description: string;
  status: ServiceStatus;
  requestDate: string;
  scheduledDate?: string;
  completionDate?: string;
  technicianId?: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  technicianName?: string;
  cost?: number;
  estimatedCost?: number;
  images?: string[];
  rating?: number;
  feedback?: string;
  isPaid: boolean;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  propertyId?: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  scheduledDate?: string;
  technicianName?: string;
  estimatedCost?: number;
  images?: string[];
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  status?: ServiceStatus;
  scheduledDate?: string;
  technicianId?: string;
  technicianName?: string;
  cost?: number;
  estimatedCost?: number;
  isPaid?: boolean;
}

export interface RateServiceDto {
  rating: number;
  feedback?: string;
}

export interface ServiceFilters {
  serviceType?: ServiceType;
  status?: ServiceStatus;
  propertyId?: string;
}

export interface ServiceStats {
  byStatus: {
    pending?: number;
    in_progress?: number;
    completed?: number;
    cancelled?: number;
  };
  byServiceType: {
    [key in ServiceType]?: {
      count: number;
      avgCost: number;
    };
  };
}
