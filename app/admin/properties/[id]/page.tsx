'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../../store/adminAuthStore';
import { useParams, useRouter } from 'next/navigation';
import ds from '../../../../styles/adminDesignSystem';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/config';

interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  category: string;
  price: number;
  currency: string;
  status: 'pending' | 'active' | 'inactive';
  location: {
    area: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    parking?: number;
    floor?: number;
    furnished?: boolean;
    kitchen?: number;
    livingRooms?: number;
  };
  availableFor?: {
    rent: boolean;
    sale: boolean;
    rentPrice?: number;
    salePrice?: number;
    contractDuration?: number;
    numberOfInstallments?: number;
    insuranceDeposit?: number;
  };
  amenities?: Array<{ name: string; icon: string }>;
  images: Array<{ url: string; isCover: boolean }>;
  isQDP: boolean;
  ownerId: any;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function AdminPropertyDetailPage() {
  const { token } = useAdminAuthStore();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (token && propertyId) {
      fetchProperty();
    }
  }, [token, propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا العقار؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchProperty(); // Refresh
      }
    } catch (error) {
      console.error('Error approving property:', error);
    }
  };

  const handleReject = async () => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchProperty(); // Refresh
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">العقار غير موجود</h2>
          <button
            onClick={() => router.push('/admin/properties')}
            className="text-blue-500 underline"
          >
            العودة إلى قائمة العقارات
          </button>
        </div>
      </div>
    );
  }

  const coverImage = property.images.find(img => img.isCover) || property.images[0];

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
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
            تفاصيل العقار
          </h1>
        </div>

        {/* Status Badge */}
        <div>
          {property.status === 'pending' && (
            <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
              قيد المراجعة
            </span>
          )}
          {property.status === 'active' && (
            <span className="px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold">
              نشط
            </span>
          )}
          {property.status === 'inactive' && (
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 font-semibold">
              غير نشط
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div style={ds.components.glassCard}>
            <div className="relative h-96 rounded-lg overflow-hidden mb-4">
              {property.images[currentImageIndex] ? (
                <Image
                  src={property.images[currentImageIndex].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">لا توجد صورة</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {property.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      currentImageIndex === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <Image src={img.url} alt={`صورة ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div style={ds.components.glassCard}>
            <h2 className="text-2xl font-bold mb-4">{property.title}</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">نوع العقار</span>
                <p className="font-semibold">{property.propertyType}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">المنطقة</span>
                <p className="font-semibold">{property.location.area}، {property.location.city}</p>
              </div>
            </div>

            {/* Availability Badges */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">التوافر</span>
              <div className="flex gap-2">
                {property.availableFor?.rent && property.availableFor?.sale ? (
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                    متاح للإيجار والبيع
                  </span>
                ) : property.availableFor?.rent ? (
                  <span className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold">
                    متاح للإيجار
                  </span>
                ) : property.availableFor?.sale ? (
                  <span className="px-4 py-2 rounded-full bg-green-500 text-white font-semibold">
                    متاح للبيع
                  </span>
                ) : null}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">الوصف</span>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">المواصفات</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{property.specifications.bedrooms}</p>
                  <p className="text-sm text-gray-600">غرف نوم</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 2c-.55 0-1 .45-1 1v.29c-1.42.11-3 .48-3 1.71v1.54c-.15.12-.27.29-.29.46h-.03c-.17 0-.33.08-.43.2s-.15.29-.12.45l.74 3.45c.01.04.02.09.03.13.41 1.37 1.42 2.44 2.73 2.82L7.5 19v1h1v-1h8v1h1v-1h-1.38l-.08-5.96c1.31-.38 2.32-1.45 2.73-2.82.01-.04.02-.09.03-.13l.74-3.45c.03-.16-.02-.33-.12-.45s-.26-.2-.43-.2h-.03c-.02-.17-.14-.34-.29-.46V5c0-1.23-1.58-1.6-3-1.71V3c0-.55-.45-1-1-1H9zm-1 5h9V6h-9v1z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{property.specifications.bathrooms}</p>
                  <p className="text-sm text-gray-600">حمامات</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{property.specifications.areaSqm}</p>
                  <p className="text-sm text-gray-600">متر مربع</p>
                </div>
              </div>

              {property.specifications.parking && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.specifications.parking}</p>
                    <p className="text-sm text-gray-600">مواقف سيارات</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">المرافق</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span className="text-sm">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Pricing and Actions */}
        <div className="space-y-6">
          {/* Pricing */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">السعر</h3>

            {property.availableFor?.rent && property.availableFor?.sale ? (
              // Both rent and sale
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <span className="text-sm text-gray-600 block mb-1">سعر الإيجار</span>
                  <p className="text-3xl font-bold text-blue-600">
                    {property.availableFor.rentPrice?.toLocaleString()} ر.ق
                  </p>
                  <span className="text-sm text-gray-500">/ شهر</span>
                  {property.availableFor.insuranceDeposit && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600">التأمين: </span>
                      <span className="text-sm font-semibold">{property.availableFor.insuranceDeposit.toLocaleString()} ر.ق</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-600 block mb-1">سعر البيع</span>
                  <p className="text-3xl font-bold text-green-600">
                    {property.availableFor.salePrice?.toLocaleString()} ر.ق
                  </p>
                </div>
              </div>
            ) : property.availableFor?.rent ? (
              // Rent only
              <div>
                <p className="text-4xl font-bold mb-2">
                  {property.availableFor.rentPrice?.toLocaleString()} ر.ق
                </p>
                <span className="text-gray-500">/ شهر</span>
                {property.availableFor.insuranceDeposit && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600 block mb-1">التأمين</span>
                    <p className="text-xl font-semibold">{property.availableFor.insuranceDeposit.toLocaleString()} ر.ق</p>
                  </div>
                )}
                {property.availableFor.contractDuration && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600 block mb-1">مدة العقد</span>
                    <p className="text-xl font-semibold">{property.availableFor.contractDuration} شهر</p>
                  </div>
                )}
              </div>
            ) : property.availableFor?.sale ? (
              // Sale only
              <div>
                <p className="text-4xl font-bold">
                  {property.availableFor.salePrice?.toLocaleString()} ر.ق
                </p>
              </div>
            ) : (
              // Fallback
              <div>
                <p className="text-4xl font-bold">
                  {property.price?.toLocaleString()} ر.ق
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {property.status === 'pending' && (
            <div style={ds.components.glassCard}>
              <h3 className="text-xl font-bold mb-4">الإجراءات</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full py-3 px-6 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                >
                  الموافقة على العقار
                </button>
                <button
                  onClick={handleReject}
                  className="w-full py-3 px-6 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  رفض العقار
                </button>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/admin/bookings?propertyId=${property._id}`)}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-right flex items-center justify-between"
              >
                <span>طلبات الحجز</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </button>
              <button
                onClick={() => router.push(`/admin/transfers?propertyId=${property._id}`)}
                className="w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-right flex items-center justify-between"
              >
                <span>طلبات النقل</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Property Info */}
          <div style={ds.components.glassCard}>
            <h3 className="text-xl font-bold mb-4">معلومات إضافية</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">المصدر</span>
                <span className="font-semibold">{property.isQDP ? 'QDP' : 'خارجي'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإنشاء</span>
                <span className="font-semibold">{new Date(property.createdAt).toLocaleDateString('ar-QA')}</span>
              </div>
              {property.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الموافقة</span>
                  <span className="font-semibold">{new Date(property.approvedAt).toLocaleDateString('ar-QA')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {property.status === 'inactive' && property.rejectionReason && (
            <div style={ds.components.glassCard} className="bg-red-50 border border-red-200">
              <h3 className="text-lg font-bold mb-2 text-red-800">سبب الرفض</h3>
              <p className="text-sm text-red-700">{property.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
