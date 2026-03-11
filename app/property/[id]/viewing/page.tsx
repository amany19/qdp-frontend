'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { usePropertyDetail } from '@/hooks/useProperties';
import { API_BASE_URL } from '@/lib/config';

/**
 * Request Property Viewing Appointment
 * Creates an appointment for viewing the property
 */

const appointmentSchema = z.object({
  date: z.string().min(1, 'الرجاء اختيار التاريخ'),
  time: z.string().min(1, 'الرجاء اختيار الوقت'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function RequestViewingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const { data: property, isLoading } = usePropertyDetail(propertyId);
  const [submitting, setSubmitting] = useState(false);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const watchDate = watch('date');

  // Fetch booked time slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!watchDate || !propertyId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/property/${propertyId}/booked-slots?date=${watchDate}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (response.ok) {
          const slots = await response.json();
          setBookedTimeSlots(slots);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };

    fetchBookedSlots();
  }, [watchDate, propertyId]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setSubmitting(true);

      // Create appointment via API
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          propertyId,
          appointmentType: 'viewing',
          date: data.date,
          time: data.time,
          notes: data.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إنشاء الموعد');
      }

      const appointment = await response.json();

      toast.success('تم إنشاء موعد المعاينة بنجاح!');

      // Navigate to appointments page
      router.push('/appointments');
    } catch (error: unknown) {
      // Show the error message from the server (which includes the Arabic double-booking message)
      const err = error as { message?: string };
      toast.error(err.message || 'فشل في إنشاء الموعد');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-48" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            طلب معاينة
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Property Info */}
        {property && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-2">{property.title}</h3>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {property.location.city}، {property.location.area}
            </p>
          </div>
        )}

        {/* Appointment Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h2 className="text-lg font-bold mb-4">اختر موعد المعاينة</h2>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              التاريخ
            </label>
            <input
              {...register('date')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              الوقت
            </label>
            <select
              {...register('time')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">اختر الوقت</option>
              <option value="09:00 AM" disabled={bookedTimeSlots.includes('09:00 AM')}>
                09:00 صباحاً {bookedTimeSlots.includes('09:00 AM') && '(محجوز)'}
              </option>
              <option value="10:00 AM" disabled={bookedTimeSlots.includes('10:00 AM')}>
                10:00 صباحاً {bookedTimeSlots.includes('10:00 AM') && '(محجوز)'}
              </option>
              <option value="11:00 AM" disabled={bookedTimeSlots.includes('11:00 AM')}>
                11:00 صباحاً {bookedTimeSlots.includes('11:00 AM') && '(محجوز)'}
              </option>
              <option value="12:00 PM" disabled={bookedTimeSlots.includes('12:00 PM')}>
                12:00 ظهراً {bookedTimeSlots.includes('12:00 PM') && '(محجوز)'}
              </option>
              <option value="01:00 PM" disabled={bookedTimeSlots.includes('01:00 PM')}>
                01:00 مساءً {bookedTimeSlots.includes('01:00 PM') && '(محجوز)'}
              </option>
              <option value="02:00 PM" disabled={bookedTimeSlots.includes('02:00 PM')}>
                02:00 مساءً {bookedTimeSlots.includes('02:00 PM') && '(محجوز)'}
              </option>
              <option value="03:00 PM" disabled={bookedTimeSlots.includes('03:00 PM')}>
                03:00 مساءً {bookedTimeSlots.includes('03:00 PM') && '(محجوز)'}
              </option>
              <option value="04:00 PM" disabled={bookedTimeSlots.includes('04:00 PM')}>
                04:00 مساءً {bookedTimeSlots.includes('04:00 PM') && '(محجوز)'}
              </option>
              <option value="05:00 PM" disabled={bookedTimeSlots.includes('05:00 PM')}>
                05:00 مساءً {bookedTimeSlots.includes('05:00 PM') && '(محجوز)'}
              </option>
              <option value="06:00 PM" disabled={bookedTimeSlots.includes('06:00 PM')}>
                06:00 مساءً {bookedTimeSlots.includes('06:00 PM') && '(محجوز)'}
              </option>
            </select>
            {errors.time && (
              <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>
            )}
            {watchDate && bookedTimeSlots.length > 0 && (
              <p className="mt-2 text-sm text-amber-600">
                بعض الأوقات محجوزة في هذا التاريخ
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="أضف أي ملاحظات أو طلبات خاصة"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            />
          </div>
        </form>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-24 left-0 right-0 bg-white border-t border-gray-200 p-5 z-50">
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={submitting}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitting ? 'جاري الإرسال...' : 'تأكيد الموعد'}
        </button>
      </div>
    </div>
  );
}
