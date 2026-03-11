'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceType, CreateServiceDto } from '@/types/service.types';
import { serviceService } from '@/services/serviceService';
import { SERVICE_TYPES } from '@/utils/serviceConstants';
import SuccessPopup from '@/components/ui/SuccessPopup';
import HeaderCard from '@/components/ui/HeaderCard';
import { ArrowRight } from 'lucide-react';

export default function NewServicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateServiceDto>({
    serviceType: 'furniture',
    title: '',
    description: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const timeSlots = ['6:00م', '8:00م', '10:00م', '12:00م', '2:00م', '4:00م'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time into a scheduledDate
      let scheduledDate: Date | undefined;
      if (selectedDate && selectedTime) {
        // Parse the Arabic time format (e.g., "6:00م" or "6:00ص")
        const timeStr = selectedTime.replace('م', 'PM').replace('ص', 'AM');
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/);

        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const period = timeParts[3];

          // Convert to 24-hour format
          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }

          scheduledDate = new Date(selectedDate);
          scheduledDate.setHours(hours, minutes, 0, 0);
        }
      }

      // Set title based on service type if not manually set
      const serviceData: any = {
        ...formData,
        title: formData.title || SERVICE_TYPES[formData.serviceType].nameAr,
      };

      // Add scheduledDate if available
      if (scheduledDate) {
        serviceData.scheduledDate = scheduledDate.toISOString();
      }

      console.log('Creating service with data:', serviceData);
      const createdService = await serviceService.create(serviceData);
      console.log('Service created successfully:', createdService);
      setShowSuccessPopup(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/services');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error creating service:', err);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to create service request');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
        <HeaderCard
          title="طلب خدمة جديدة"
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

      <form onSubmit={handleSubmit} className="px-5 py-6">
        {/* Service Type Dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            اختر خدمتك
          </label>
          <select
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-right"
          >
            {(Object.entries(SERVICE_TYPES) as [ServiceType, typeof SERVICE_TYPES[ServiceType]][]).map(
              ([type, info]) => (
                <option key={type} value={type}>
                  {info.icon} {info.nameAr}
                </option>
              )
            )}
          </select>
        </div>

        {/* Date Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            تاريخ الخدمة
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-right"
            placeholder="اختر تاريخ الخدمة"
          />
        </div>

        {/* Time Slots */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            الوقت المناسب
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedTime === time
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Notes/Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            ملاحظات
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            rows={4}
            placeholder="اكتب ملاحظاتك هنا"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.description}
          className="w-full bg-black text-white rounded-lg py-3.5 font-medium text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </form>

      {/* Success Popup */}
      {showSuccessPopup && (
                    <SuccessPopup
                 isOpen={showSuccess}
                 title=" لقد تم إرسال طلبك بنجاح"
                 description=" ستقوم بإخطارك فور الموافقة على الموعد"
                 onClose={() => {
                   setShowSuccess(false);
               
                 }}
                 icon="success"
          />
      )}
    </div>
  );
}
