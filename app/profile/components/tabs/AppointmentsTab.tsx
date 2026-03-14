'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Building } from 'lucide-react';
import StatusBadge, { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { appointmentService, type Appointment } from '@/services/appointmentService';

export default function AppointmentsTab() {
  const router = useRouter();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['profile-appointments'],
    queryFn: () => appointmentService.getAll(),
  });

  const getStatusBadgeVariant = (status: string): StatusBadgeVariant => {
    switch (status) {
      case 'confirmed': return 'confirmed';
      case 'unconfirmed': return 'pending';
      case 'received': return 'completed';
      case 'in_progress': return 'pending';
      case 'agent': return 'agent';
      default: return 'pending';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'unconfirmed': return 'غير مؤكد';
      case 'received': return 'استلم';
      case 'in_progress': return 'جاري التنفيذ';
      case 'agent': return 'وكيل العقارات';
      default: return status;
    }
  };

  const getAppointmentTypeText = (type: string): string => {
    if (type === 'viewing') return 'معاينة';
    if (type === 'appliance_delivery') return 'تسليم جهاز';
    return 'تسليم';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Calendar className="w-16 h-16 mx-auto text-gray-300" />
        <p className="text-gray-500">لا توجد مواعيد حتى الآن</p>
        <button
          onClick={() => router.push('/appointments')}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium"
        >
          مواعيدي
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {appointments.slice(0, 5).map((appointment) => {
          const isApplianceDelivery = appointment.appointmentType === 'appliance_delivery';
          const applianceBooking = appointment.applianceBookingId;
          const property = appointment.propertyId;

          if (isApplianceDelivery && applianceBooking) {
            const appliance = applianceBooking.applianceId;
            const title = appliance?.nameAr || appliance?.nameEn || appliance?.model || 'جهاز';
            return (
              <div
                key={appointment._id}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
              >
                <h3 className="font-bold text-base text-gray-900">
                  {title}
                  {appliance?.brand && ` - ${appliance.brand}`}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>موعد تسليم الجهاز</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString('ar-QA', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time || '—'}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    variant={getStatusBadgeVariant(appointment.status)}
                    label={getStatusText(appointment.status)}
                  />
                  <StatusBadge
                    variant="agent"
                    label={getAppointmentTypeText(appointment.appointmentType)}
                    showIcon={false}
                  />
                </div>
                <button
                  onClick={() => router.push(`/appointments/${appointment._id}`)}
                  className="text-sm text-gray-900 underline hover:text-gray-700"
                >
                  عرض التفاصيل
                </button>
              </div>
            );
          }

          if (!property) return null;

          return (
            <div
              key={appointment._id}
              className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
            >
              <h3 className="font-bold text-base text-gray-900">
                {property.title || property.titleAr || 'إليت هوم'}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{property.location?.city || 'الدوحة'}، {property.location?.country || 'قطر'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <Building className="w-4 h-4" />
                <span>وحدة رقم {property._id?.slice(-4) || '2048'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(appointment.date).toLocaleDateString('ar-QA', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                <Clock className="w-4 h-4" />
                <span>{appointment.time || '4:00 م'}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge
                  variant={getStatusBadgeVariant(appointment.status)}
                  label={getStatusText(appointment.status)}
                />
                <StatusBadge
                  variant="agent"
                  label={getAppointmentTypeText(appointment.appointmentType)}
                  showIcon={false}
                />
              </div>
              <button
                onClick={() => router.push(`/appointments/${appointment._id}`)}
                className="text-sm text-gray-900 underline hover:text-gray-700"
              >
                عرض التفاصيل
              </button>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => router.push('/appointments')}
        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-800 text-center"
      >
        عرض كل المواعيد
      </button>
    </div>
  );
}
