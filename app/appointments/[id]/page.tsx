"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import MapPreview from "@/components/MapPreview";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";
import { useState } from "react";
import { formatAppointmentDate } from "@/utils/date";
import { useRouter } from "next/navigation";
// Default empty appointment for type safety
const DEFAULT_APPOINTMENT: Appointment = {
  id: '',
  propertyName: '',
  city: '',
  price: 0,
  status: 'pending',
  date: '',
  time: '',
  lat: NaN,
  lng: NaN,
};

function normalizeAppointment(data: unknown): Appointment {
  if (!data) {
    console.warn("No data received for appointment");
    return DEFAULT_APPOINTMENT;
  }

  if (Array.isArray(data)) {
    return data.length > 0
      ? normalizeAppointment(data[0])
      : DEFAULT_APPOINTMENT;
  }

  const source = (data as any).data || data;

  try {
    const isApplianceDelivery = source?.appointmentType === 'appliance_delivery';
    const appliance = source?.applianceBookingId?.applianceId;
    const applianceTitle = appliance
      ? (appliance.nameAr || appliance.nameEn || appliance.model || 'جهاز') +
        (appliance.brand ? ` - ${appliance.brand}` : '')
      : 'تسليم جهاز';

    const appointment: Appointment = {
      id: String(source?._id || source?.id || ""),
      type: source?.appointmentType,

      propertyName: isApplianceDelivery
        ? applianceTitle
        : source?.propertyId?.title ||
          source?.title ||
          "Unknown Property",

      city: isApplianceDelivery
        ? "موعد تسليم الجهاز"
        : source?.propertyId?.location?.city ||
          source?.location?.address ||
          "Unknown City",

      price: isApplianceDelivery
        ? 0
        : Number(
            source?.propertyId?.availableFor?.rentPrice ||
              source?.propertyId?.price ||
              0
          ),

      status: String(
        source?.status || source?.appointmentStatus || "pending"
      ) as Appointment["status"],

      date: String(
        source?.date ||
        source?.appointmentDate ||
        new Date().toISOString().split("T")[0]
      ),

      time: String(
        source?.time ||
        source?.appointmentTime ||
        "00:00"
      ),

      lat:
        source?.location?.coordinates?.latitude ??
        source?.propertyId?.location?.coordinates?.coordinates?.[1],

      lng:
        source?.location?.coordinates?.longitude ??
        source?.propertyId?.location?.coordinates?.coordinates?.[0],
    };

    return appointment;
  } catch (error) {
    console.error("Error normalizing appointment:", error);
    return DEFAULT_APPOINTMENT;
  }
}

export default function AppointmentDetails() {
  const params = useParams();
  const id = params.id as string | undefined;
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter()
  // Fetch a single appointment by ID
  const {
    data: rawData,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid appointment ID");

      try {
        console.log(`Fetching appointment with ID: ${id}`);
        const result = await appointmentService.getById(id);
        console.log('Raw API response:', result);

        // Store debug info
        setDebugInfo(JSON.stringify(result, null, 2));

        return result;
      } catch (err) {
        console.error('API call failed:', err);
        throw err;
      }
    },
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Normalize the data to match Appointment type
  const appointment = normalizeAppointment(rawData);

  // Validate if we have meaningful data (include appliance_delivery from raw)
  const raw = (rawData as any)?.data ?? rawData;
  const isApplianceDelivery = raw?.appointmentType === 'appliance_delivery';
  const hasValidData =
    appointment.id &&
    (isApplianceDelivery ||
      (appointment.propertyName !== 'Unknown Property' &&
        appointment.city !== 'Unknown City'));

  // Guard: no id in URL
  if (!id) {
    return (
      <div className="bg-[#FDFDFD] min-h-screen font-[Tajawal] flex items-center justify-center p-5">
        <div className="text-center">
          <p className="text-xl mb-2 text-red-500">⚠️</p>
          <p className="text-red-500">Invalid appointment ID.</p>
          <p className="text-sm text-gray-500 mt-2">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#FDFDFD] min-h-screen font-[Tajawal] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#34A853] border-r-transparent"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !hasValidData) {
    return (
      <div className="bg-[#FDFDFD] min-h-screen font-[Tajawal] flex items-center justify-center p-5">
        <div className="text-center max-w-md">
          <p className="text-xl mb-2 text-red-500">⚠️</p>
          <p className="text-red-500 text-lg mb-2">Appointment not found</p>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load appointment details.'}
          </p>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm mb-2"
              >
                Retry
              </button>
              <details className="text-left bg-gray-100 p-2 rounded text-xs">
                <summary className="cursor-pointer">Debug Info</summary>
                <pre className="mt-2 overflow-auto max-h-40">
                  {debugInfo || 'No debug info available'}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state - TypeScript now knows appointment is properly typed
  return (
    <div className="bg-[#FDFDFD] min-h-screen font-[Tajawal]">
      {/* Header */}

      <div className="flex justify-between bg-white shadow-sm rounded-b-[30px] p-4 text-center font-semibold text-lg">
        <button
          onClick={() => router.back()}
          className=" self-start hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-900" />
        </button>
        <span className="self-center">
          تفاصيل الموعد
        </span>
        <span></span>
      </div>

      <div className="p-5 space-y-4">
        {/* Property / Appliance Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-3  py-4 space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="font-bold text-md">{appointment.propertyName}</h2>
            {appointment.type !== 'appliance_delivery' && (
              <button className="border px-3 py-1 rounded-lg text-sm bg-white">معاينة</button>
            )}
          </div>
          <div className="flex justify-start items-center gap-2">
            <div className="flex justify-end items-center gap-2 text-gray-500 text-sm">
              <MapPin size={16} />
              <span>{appointment.city}</span>
            </div>
          </div>
          <div className="flex flex-col justify-end items-end">
            {appointment.type !== 'appliance_delivery' && (
              <span>
                <span className="text-lg font-bold text-gray-900">
                  {appointment.price.toLocaleString()}
                </span>
                <span className="text-sm text-[#000]">
                  ر.ق/شهر
                </span>
              </span>
            )}
            {appointment.status && (
              <div
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${appointment.status === "confirmed"
                  ? "bg-[#E0F3ED] text-[#34A853]"
                  : appointment.status === "cancelled"
                    ? "bg-[#FCE8E6] text-[#EA4335]"
                    : "bg-[#FFF3E0] text-[#FB8C00]"
                  }`}
              >
                {appointment.status === "confirmed"
                  ? "مؤكد"
                  : appointment.status === "cancelled"
                    ? "ملغي"
                    : "قيد الانتظار"}
              </div>
            )}
          </div>
        </div>

        {/* Date Card */}
        <div className="flex flex-col  items-start bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">

          <div className="flex items-center gap-1">
            <Calendar size={20} className="text-[#000]" />

            <span className="text-[#000] font-medium">تاريخ الموعد</span>
          </div>
          <div className="text-gray-600">{formatAppointmentDate(appointment.date)}</div>
        </div>

        {/* Time Card */}
        <div className="flex flex-col items-start bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">

          <div className="flex items-center gap-1 ">
            <Clock size={20} className="text-[#000]" />

            <span className="ftext-[#000] font-medium">وقت الموعد</span>
          </div>
          <div className="text-gray-600">{appointment.time}</div>
        </div>

        {/* Address + Map */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 space-y-2">
          <div className="flex justify-start items-center gap-1  font-medium">
            <MapPin size={20} className="text-[#000]" />
            <span>العنوان</span>
          </div>

          <div className="text-gray-600 text-sm text-right">{appointment.city}</div>

          {typeof appointment.lat === 'number' &&
            typeof appointment.lng === 'number' &&
            !isNaN(appointment.lat) &&
            !isNaN(appointment.lng) && (
              <div className="rounded-xl overflow-hidden h-[140px] mt-2">
                <MapPreview
                  lat={appointment.lat}
                  lng={appointment.lng}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}