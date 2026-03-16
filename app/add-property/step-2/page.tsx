'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/auth/RoleGuard';
import LocationPicker, { type LocationCoords } from '@/components/add-property/LocationPicker';

/**
 * Add Property - Step 2
 * Design Reference: Add Adv-2.png
 *
 * Fields:
 * - Property Condition (حالة العقار)
 * - Property Area (مساحة العقار)
 * - Number of Rooms detail (عدد الغرف) - with +/- controls
 * - Number of Bathrooms detail (عدد دورات المياه) - with +/- controls
 * - Number of Living Rooms (عدد الصالات) - with +/- controls
 * - Facade (الواجهة)
 */

export default function AddPropertyStep2() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    propertyCondition: 'excellent',
    propertyArea: '',
    rooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    facade: 'north',
    address: '',
    landmark: '',
    parkingSpaces: 0,
    floorNumber: 0,
    totalFloors: 0,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const propertyConditions = [
    { value: 'new', label: 'جديد' },
    { value: 'excellent', label: 'ممتاز' },
    { value: 'good', label: 'جيد' },
    { value: 'fair', label: 'مقبول' },
  ];

  const facades = [
    { value: 'north', label: 'شمالي' },
    { value: 'south', label: 'جنوبي' },
    { value: 'east', label: 'شرقي' },
    { value: 'west', label: 'غربي' },
    { value: 'multiple', label: 'متعدد' },
  ];

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    const step1Data = sessionStorage.getItem('addPropertyStep1');
    if (!step1Data) {
      toast.error('الرجاء إكمال الخطوة الأولى');
      router.push('/add-property/step-1');
      return;
    }
    // Restore step2 from session (e.g. user went back from step 3)
    const step2Raw = sessionStorage.getItem('addPropertyStep2');
    if (step2Raw) {
      try {
        const step2 = JSON.parse(step2Raw);
        setFormData((prev) => ({
          ...prev,
          ...step2,
          propertyArea: step2.propertyArea?.toString() ?? prev.propertyArea,
          latitude: step2.latitude ?? null,
          longitude: step2.longitude ?? null,
        }));
      } catch {
        // ignore
      }
    }
  }, [router]);

  const handleContinue = () => {
    if (!formData.propertyArea.trim()) {
      toast.error('الرجاء إدخال مساحة العقار');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('الرجاء إدخال العنوان');
      return;
    }

    // Store data in sessionStorage (include location coords if set)
    const step2Data = {
      propertyCondition: formData.propertyCondition,
      propertyArea: parseFloat(formData.propertyArea),
      rooms: formData.rooms,
      bathrooms: formData.bathrooms,
      livingRooms: formData.livingRooms,
      facade: formData.facade,
      address: formData.address,
      landmark: formData.landmark,
      parkingSpaces: formData.parkingSpaces,
      floorNumber: formData.floorNumber,
      totalFloors: formData.totalFloors,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };
    sessionStorage.setItem('addPropertyStep2', JSON.stringify(step2Data));

    router.push('/add-property/step-3');
  };

  const handleLocationChange = (coords: LocationCoords | null) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    }));
  };

  return (

    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            اضافة اعلان
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Progress Indicator - Step 2 */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            {/* Step 3 */}
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div className="w-20 h-0.5 bg-gray-300"></div>

            {/* Step 2 - Active */}
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="w-20 h-0.5 bg-black"></div>

            {/* Step 1 - Completed */}
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">حالة العقار</p>
        </div>

        {/* Property Condition */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            حالة العقار
          </label>
          <select
            value={formData.propertyCondition}
            onChange={(e) => updateField('propertyCondition', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {propertyConditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>

        {/* Property Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            مساحة العقار (متر مربع)
          </label>
          <input
            type="number"
            value={formData.propertyArea}
            onChange={(e) => updateField('propertyArea', e.target.value)}
            placeholder="ادخل مساحة العقار"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            العنوان التفصيلي
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="مثال: شارع 44 احمد ابن حنبل"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Landmark */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            معلم قريب (اختياري)
          </label>
          <input
            type="text"
            value={formData.landmark}
            onChange={(e) => updateField('landmark', e.target.value)}
            placeholder="مثال: بالقرب من مركز سيتي سنتر"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Location: map link / current location / map picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            موقع العقار على الخريطة
          </label>
          <LocationPicker
            value={
              formData.latitude != null && formData.longitude != null
                ? { lat: formData.latitude, lng: formData.longitude }
                : null
            }
            onChange={handleLocationChange}
            height="220px"
          />
          <p className="text-xs text-gray-500 mt-1.5 text-right">
            الصق رابط مشاركة من Google Maps، أو استخدم موقعك الحالي، أو انقر على الخريطة
          </p>
        </div>

        {/* Number of Rooms with +/- controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد الغرف
          </label>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('rooms', Math.max(1, formData.rooms - 1))}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              −
            </button>
            <span className="text-lg font-medium">{formData.rooms}</span>
            <button
              type="button"
              onClick={() => updateField('rooms', formData.rooms + 1)}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Number of Bathrooms with +/- controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد دورات المياه
          </label>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('bathrooms', Math.max(1, formData.bathrooms - 1))}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              −
            </button>
            <span className="text-lg font-medium">{formData.bathrooms}</span>
            <button
              type="button"
              onClick={() => updateField('bathrooms', formData.bathrooms + 1)}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Number of Living Rooms with +/- controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد الصالات
          </label>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('livingRooms', Math.max(1, formData.livingRooms - 1))}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              −
            </button>
            <span className="text-lg font-medium">{formData.livingRooms}</span>
            <button
              type="button"
              onClick={() => updateField('livingRooms', formData.livingRooms + 1)}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Parking Spaces */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3 text-right">
            عدد مواقف السيارات
          </label>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => updateField('parkingSpaces', Math.max(0, formData.parkingSpaces - 1))}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              −
            </button>
            <span className="text-lg font-medium">{formData.parkingSpaces}</span>
            <button
              type="button"
              onClick={() => updateField('parkingSpaces', formData.parkingSpaces + 1)}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-600 hover:text-black transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Floor Number */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            رقم الطابق
          </label>
          <input
            type="number"
            value={formData.floorNumber}
            onChange={(e) => updateField('floorNumber', parseInt(e.target.value) || 0)}
            placeholder="ادخل رقم الطابق"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Total Floors */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            إجمالي عدد الطوابق
          </label>
          <input
            type="number"
            value={formData.totalFloors}
            onChange={(e) => updateField('totalFloors', parseInt(e.target.value) || 0)}
            placeholder="ادخل إجمالي عدد الطوابق"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Facade */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2 text-right">
            الواجهة
          </label>
          <select
            value={formData.facade}
            onChange={(e) => updateField('facade', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {facades.map((facade) => (
              <option key={facade.value} value={facade.value}>
                {facade.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <button
          onClick={handleContinue}
          className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white hover:bg-gray-800 transition-colors duration-200"
          dir="rtl"
        >
          متابعة
        </button>

        {/* Home indicator */}
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
