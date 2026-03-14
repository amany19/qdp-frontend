'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types/service.types';
import { serviceService } from '@/services/serviceService';
import { getServiceTypeName } from '@/utils/serviceConstants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import StatusBadge, { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { Calendar, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import HeaderCard from '@/components/ui/HeaderCard';

export default function ServicesPage() {
  const router = useRouter();
  const [currentServices, setCurrentServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();

    // Refresh services when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchServices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const current = await serviceService.getCurrent();
      console.log('Fetched current services:', current);
      console.log('Number of services:', current.length);
      setCurrentServices(current);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error fetching services:', err);
      setError(error.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'م' : 'ص';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${minutes} ${period}`;
    } catch {
      return '';
    }
  };

  const getStatusBadgeVariant = (status: string): StatusBadgeVariant => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'in_progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'in_progress':
        return 'جاري التنفيذ';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    return (
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => router.push(`/services/${service._id}`)}
      >
        {/* Service Type Title */}
        <h3 className="text-base font-bold text-gray-900 mb-3">
          {getServiceTypeName(service.serviceType)}
        </h3>

        {/* Date and Time */}
        {service.scheduledDate && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(service.scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(service.scheduledDate)}</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-3">
          <StatusBadge
            variant={getStatusBadgeVariant(service.status)}
            label={getStatusText(service.status)}
          />
        </div>

        {/* View Details Link */}
        <button className="text-sm text-black underline font-medium hover:text-gray-700">
          عرض التفاصيل
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-8 bg-gray-50" dir="rtl">
      {/* Header */}
        <HeaderCard
          title="خدمات الصيانة"
          leftButton={
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="رجوع"
            >
              <ArrowRight className="w-5 h-5 text-gray-900" />
            </button>
          }
        />

      <div className="px-5 py-6">
        {/* Request New Service Button */}
        <button
          onClick={() => router.push('/services/new')}
          className="w-full bg-black text-white rounded-lg py-3.5 font-medium text-base mb-6 flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>أطلب خدمة جديدة</span>
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Current Requests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => fetchServices()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🔄 تحديث
            </button>
            <h2 className="text-lg font-bold text-gray-900">الطلبات الجارية</h2>
          </div>

          {currentServices.length > 0 ? (
            currentServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                لا توجد طلبات جارية
              </h3>
              <p className="text-gray-600">
                ابدأ بطلب خدمة صيانة جديدة
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
