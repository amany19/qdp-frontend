import { ServiceType, ServiceStatus } from '@/types/service.types';

export const SERVICE_TYPES: Record<ServiceType, { nameAr: string; nameEn: string; icon: string; color: string }> = {
  furniture: {
    nameAr: 'صيانة الأثاث',
    nameEn: 'Furniture Maintenance',
    icon: '🪑',
    color: '#8B5CF6'
  },
  plumbing: {
    nameAr: 'صيانة السباكة',
    nameEn: 'Plumbing Services',
    icon: '🚰',
    color: '#3B82F6'
  },
  electrical: {
    nameAr: 'صيانة الكهرباء',
    nameEn: 'Electrical Services',
    icon: '⚡',
    color: '#F59E0B'
  },
  ac: {
    nameAr: 'صيانة التكييف',
    nameEn: 'AC Maintenance',
    icon: '❄️',
    color: '#10B981'
  }
};

export const SERVICE_STATUS: Record<ServiceStatus, { nameAr: string; nameEn: string; color: string; bgColor: string }> = {
  pending: {
    nameAr: 'قيد الانتظار',
    nameEn: 'Pending',
    color: '#F59E0B',
    bgColor: '#FEF3C7'
  },
  in_progress: {
    nameAr: 'جاري التنفيذ',
    nameEn: 'In Progress',
    color: '#EF4444',
    bgColor: '#FEE2E2'
  },
  completed: {
    nameAr: 'مكتمل',
    nameEn: 'Completed',
    color: '#10B981',
    bgColor: '#D1FAE5'
  },
  cancelled: {
    nameAr: 'ملغي',
    nameEn: 'Cancelled',
    color: '#6B7280',
    bgColor: '#F3F4F6'
  }
};

export function getServiceTypeName(type: ServiceType, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? SERVICE_TYPES[type].nameAr : SERVICE_TYPES[type].nameEn;
}

export function getServiceStatusName(status: ServiceStatus, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? SERVICE_STATUS[status].nameAr : SERVICE_STATUS[status].nameEn;
}

export function getServiceStatusColor(status: ServiceStatus): { color: string; bgColor: string } {
  return {
    color: SERVICE_STATUS[status].color,
    bgColor: SERVICE_STATUS[status].bgColor
  };
}
