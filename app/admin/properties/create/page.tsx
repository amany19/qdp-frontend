'use client';

import React, { useState } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

export default function AdminPropertyCreatePage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: 'apartment',
    price: '',

    // Availability
    availableForRent: false,
    availableForSale: true,
    rentPrice: '',
    salePrice: '',
    contractDuration: '12',
    numberOfInstallments: '12',
    insuranceDeposit: '',

    // Specifications
    bedrooms: '',
    bathrooms: '',
    livingRooms: '',
    areaSqm: '',
    floorNumber: '',
    totalFloors: '',
    parkingSpaces: '',
    furnishingStatus: 'unfurnished',

    // Property Details
    propertyCondition: 'good',
    facade: 'north',

    // Location
    address: '',
    city: 'Doha',
    area: '',
    building: '',
    landmark: '',
    latitude: '',
    longitude: '',

    // Media
    imageUrl: '',
    videoUrl: '',

    // Amenities (common ones)
    amenity_security: false,
    amenity_parking: false,
    amenity_elevator: false,
    amenity_ac: false,
    amenity_gym: false,
    amenity_pool: false,
    amenity_garden: false,
    amenity_balcony: false,

    // Settings
    status: 'active',
    isFeatured: false,
    allowComments: true,
    allowMessages: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.availableForRent && !formData.availableForSale) {
      alert('يجب اختيار خيار واحد على الأقل (إيجار أو بيع)');
      return;
    }

    setSaving(true);

    try {
      // Build amenities array
      const amenities = [];
      if (formData.amenity_security) amenities.push('24/7 Security');
      if (formData.amenity_parking) amenities.push('Covered Parking');
      if (formData.amenity_elevator) amenities.push('Elevator');
      if (formData.amenity_ac) amenities.push('Central AC');
      if (formData.amenity_gym) amenities.push('Gym');
      if (formData.amenity_pool) amenities.push('Swimming Pool');
      if (formData.amenity_garden) amenities.push('Garden');
      if (formData.amenity_balcony) amenities.push('Balcony');

      // Build property data
      const propertyData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        category: formData.availableForRent ? 'rent' : 'sale', // Fallback category
        price: parseFloat(formData.price) || 0,
        currency: 'QAR',

        availableFor: {
          rent: formData.availableForRent,
          sale: formData.availableForSale,
        },

        specifications: {
          areaSqm: parseFloat(formData.areaSqm) || 0,
          furnishingStatus: formData.furnishingStatus,
        },

        propertyCondition: formData.propertyCondition,
        facade: formData.facade,

        location: {
          address: formData.address,
          city: formData.city,
          area: formData.area,
          building: formData.building || undefined,
          landmark: formData.landmark || undefined,
          coordinates: {
            type: 'Point',
            coordinates: [
              parseFloat(formData.longitude) || 51.5,
              parseFloat(formData.latitude) || 25.3
            ]
          }
        },

        images: formData.imageUrl ? [{
          url: formData.imageUrl,
          isCover: true,
          order: 1
        }] : [],

        amenities,
        status: formData.status,
        isFeatured: formData.isFeatured,
        videoUrl: formData.videoUrl || undefined,
        allowComments: formData.allowComments,
        allowMessages: formData.allowMessages,
        publishedAt: new Date(),
      };

      // Add rent-specific fields
      if (formData.availableForRent) {
        propertyData.availableFor.rentPrice = parseFloat(formData.rentPrice) || 0;
        propertyData.availableFor.contractDuration = parseInt(formData.contractDuration) || 12;
        propertyData.availableFor.numberOfInstallments = parseInt(formData.numberOfInstallments) || 12;
        propertyData.availableFor.insuranceDeposit = parseFloat(formData.insuranceDeposit) || 0;
      }

      // Add sale-specific fields
      if (formData.availableForSale) {
        propertyData.availableFor.salePrice = parseFloat(formData.salePrice) || 0;
      }

      // Add optional specification fields
      if (formData.bedrooms) propertyData.specifications.bedrooms = parseInt(formData.bedrooms);
      if (formData.bathrooms) propertyData.specifications.bathrooms = parseInt(formData.bathrooms);
      if (formData.livingRooms) propertyData.specifications.livingRooms = parseInt(formData.livingRooms);
      if (formData.floorNumber) propertyData.specifications.floorNumber = parseInt(formData.floorNumber);
      if (formData.totalFloors) propertyData.specifications.totalFloors = parseInt(formData.totalFloors);
      if (formData.parkingSpaces) propertyData.specifications.parkingSpaces = parseInt(formData.parkingSpaces);

      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        const created = await response.json();
        alert('تم إنشاء العقار بنجاح');
        router.push(`/admin/properties/${created._id}`);
      } else {
        const error = await response.json();
        alert(`خطأ: ${error.message || 'فشل في الإنشاء'}`);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('حدث خطأ أثناء إنشاء العقار');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/properties')}
          className="text-gray-600 hover:text-black mb-2 flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          العودة إلى قائمة العقارات
        </button>
        <h1 className="text-3xl font-bold" style={{ color: ds.colors.primary.black }}>
          إضافة عقار جديد
        </h1>
        <p className="text-gray-600 mt-2">نموذج شامل لإضافة عقار من لوحة التحكم</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Information */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">المعلومات الأساسية</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عنوان العقار *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="مثال: شقة 3 غرف في الخليج الغربي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الوصف *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="وصف تفصيلي للعقار..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع العقار *</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="apartment">شقة</option>
                      <option value="villa">فيلا</option>
                      <option value="office">مكتب</option>
                      <option value="land">أرض</option>
                      <option value="warehouse">مستودع</option>
                      <option value="showroom">صالة عرض</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">السعر الأساسي (ر.ق) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="10000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">التوافر والأسعار</h3>

              <div className="space-y-4">
                {/* Rent Option */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="availableForRent"
                      checked={formData.availableForRent}
                      onChange={(e) => setFormData({ ...formData, availableForRent: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="availableForRent" className="mr-3 font-semibold text-blue-600">
                      متاح للإيجار
                    </label>
                  </div>

                  {formData.availableForRent && (
                    <div className="space-y-3 pr-8">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">الإيجار الشهري (ر.ق)</label>
                          <input
                            type="number"
                            value={formData.rentPrice}
                            onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">التأمين (ر.ق)</label>
                          <input
                            type="number"
                            value={formData.insuranceDeposit}
                            onChange={(e) => setFormData({ ...formData, insuranceDeposit: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">مدة العقد (شهر)</label>
                          <input
                            type="number"
                            value={formData.contractDuration}
                            onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">عدد الأقساط</label>
                          <input
                            type="number"
                            value={formData.numberOfInstallments}
                            onChange={(e) => setFormData({ ...formData, numberOfInstallments: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sale Option */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="availableForSale"
                      checked={formData.availableForSale}
                      onChange={(e) => setFormData({ ...formData, availableForSale: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="availableForSale" className="mr-3 font-semibold text-green-600">
                      متاح للبيع
                    </label>
                  </div>

                  {formData.availableForSale && (
                    <div className="pr-8">
                      <label className="block text-sm font-medium mb-1">سعر البيع (ر.ق)</label>
                      <input
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">المواصفات</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">المساحة (متر مربع) *</label>
                  <input
                    type="number"
                    value={formData.areaSqm}
                    onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">غرف النوم</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الحمامات</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الصالات</label>
                  <input
                    type="number"
                    value={formData.livingRooms}
                    onChange={(e) => setFormData({ ...formData, livingRooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم الطابق</label>
                  <input
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">إجمالي الطوابق</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">مواقف السيارات</label>
                  <input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">حالة الأثاث</label>
                  <select
                    value={formData.furnishingStatus}
                    onChange={(e) => setFormData({ ...formData, furnishingStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="unfurnished">غير مفروش</option>
                    <option value="semi-furnished">نصف مفروش</option>
                    <option value="furnished">مفروش بالكامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">حالة العقار</label>
                  <select
                    value={formData.propertyCondition}
                    onChange={(e) => setFormData({ ...formData, propertyCondition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="new">جديد</option>
                    <option value="excellent">ممتاز</option>
                    <option value="good">جيد</option>
                    <option value="fair">مقبول</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">الواجهة</label>
                <select
                  value={formData.facade}
                  onChange={(e) => setFormData({ ...formData, facade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="north">شمالية</option>
                  <option value="south">جنوبية</option>
                  <option value="east">شرقية</option>
                  <option value="west">غربية</option>
                  <option value="multiple">متعددة</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الموقع</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="الشارع والرقم"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المدينة *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    >
                      <option value="Doha">الدوحة</option>
                      <option value="Al Rayyan">الريان</option>
                      <option value="Al Wakrah">الوكرة</option>
                      <option value="Lusail">لوسيل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المنطقة *</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="مثال: الخليج الغربي"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المبنى</label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="رقم المبنى"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">معلم قريب</label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="مثال: قرب سوق واقف"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">خط العرض</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="25.3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">خط الطول</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="51.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الوسائط</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رابط الفيديو</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">المرافق والخدمات</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'amenity_security', label: 'أمن 24/7' },
                  { key: 'amenity_parking', label: 'موقف مغطى' },
                  { key: 'amenity_elevator', label: 'مصعد' },
                  { key: 'amenity_ac', label: 'تكييف مركزي' },
                  { key: 'amenity_gym', label: 'صالة رياضية' },
                  { key: 'amenity_pool', label: 'مسبح' },
                  { key: 'amenity_garden', label: 'حديقة' },
                  { key: 'amenity_balcony', label: 'شرفة' },
                ].map((amenity) => (
                  <div key={amenity.key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={amenity.key}
                      checked={formData[amenity.key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [amenity.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor={amenity.key} className="mr-2 text-sm">
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Settings */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الحالة والإعدادات</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">حالة العقار</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="pending">قيد المراجعة</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="sold">مباع</option>
                    <option value="rented">مؤجر</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="isFeatured" className="mr-2 text-sm font-medium">
                    عقار مميز
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowComments"
                    checked={formData.allowComments}
                    onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="allowComments" className="mr-2 text-sm font-medium">
                    السماح بالتعليقات
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMessages"
                    checked={formData.allowMessages}
                    onChange={(e) => setFormData({ ...formData, allowMessages: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="allowMessages" className="mr-2 text-sm font-medium">
                    السماح بالرسائل
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الإجراءات</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-6 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                >
                  {saving ? 'جاري الحفظ...' : 'إنشاء العقار'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/properties')}
                  className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
