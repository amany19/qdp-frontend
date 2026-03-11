'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, Clock, MapPin, Building } from 'lucide-react';
import StatusBadge, { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { appointmentService, type Appointment } from '@/services/appointmentService';
import HeaderCard from '@/components/ui/HeaderCard';

/**
 * Appointments List Page
 * Shows all user's viewing and delivery appointments with tab navigation
 * Design: My Appointments.png
 */

type TabType = 'all' | 'delivery' | 'viewing';

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', activeTab],
    queryFn: async () => {
      if (activeTab === 'all') {
        return await appointmentService.getAll();
      } else {
        return await appointmentService.getByType(activeTab);
      }
    },
  });

  const getStatusBadgeVariant = (status: string): StatusBadgeVariant => {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'unconfirmed':
        return 'pending';
      case 'received':
        return 'completed';
      case 'in_progress':
        return 'pending';
      case 'agent':
        return 'agent';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'unconfirmed':
        return 'غير مؤكد';
      case 'received':
        return 'استلم';
      case 'in_progress':
        return 'جاري التنفيذ';
      case 'agent':
        return 'وكيل العقارات';
      default:
        return status;
    }
  };

  const getAppointmentTypeText = (type: string): string => {
    return type === 'viewing' ? 'معاينة' : 'تسليم';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    
    <>
      <div className="min-h-screen bg-white pb-24" dir="rtl">
        {/* Header */}
   <div className="bg-white px-5 py-3 border-b border-gray-100 rounded-b-4xl shadow-sm mb-1">
             <div className="flex items-start justify-between">

        <div className="flex flex-col gap-1 text-right">
          <h2 className="text-lg font-bold text-gray-900">
            أهلاً بك !
          </h2>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>شارع 44 احمد ابن حنبل</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/notifications')}
          className="p-2 bg-[#F3F1EB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-900" />
        </button>

      </div>
    </div>
        {/* Tab Navigation */}
        <div className="bg-white px-5 py-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'delivery'
                ? 'bg-black text-white'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              مواعيد التسليم
            </button>
            <button
              onClick={() => setActiveTab('viewing')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'viewing'
                ? 'bg-black text-white'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              مواعيد المعاينة
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          {!appointments || appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                لا توجد مواعيد حتى الآن
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const property = appointment.propertyId;
                if (!property) return null;

                return (
                  <div
                    key={appointment._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    {/* Property Name */}
                    <h3 className="font-bold text-base text-gray-900">
                      {property.title || property.titleAr || 'إليت هوم'}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location?.city || 'الدوحة'}، {property.location?.country || 'قطر'}</span>
                    </div>

                    {/* Unit Number */}
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Building className="w-4 h-4" />
                      <span>وحدة رقم {property._id?.slice(-4) || '2048'}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(appointment.date).toLocaleDateString('ar-QA', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time || '4:00 م'}</span>
                    </div>

                    {/* Status and Type Badges */}
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

                    {/* View Details Link */}
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
          )}
        </div>
      </div>
     <BottomNavigation centerButton={{
          onClick: () => router.push('/appointments/book'), 
          label: 'إضافة',
        }}/>
    </>
  );
}
