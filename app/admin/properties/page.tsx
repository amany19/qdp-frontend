'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { useRouter } from 'next/navigation';
import ds from '../../../styles/adminDesignSystem';
import { API_BASE_URL } from '@/lib/config';

interface Property {
  _id: string;
  title: string;
  propertyType: string;
  category: string;
  price: number;
  status: 'pending' | 'active' | 'inactive';
  location: {
    area: string;
    city: string;
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  };
  availableFor?: {
    rent: boolean;
    sale: boolean;
    rentPrice?: number;
    salePrice?: number;
  };
  images: Array<{ url: string; isCover: boolean }>;
  isQDP: boolean;
  createdAt: string;
}

export default function AdminPropertiesPage() {
  const { token } = useAdminAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allPropertiesStats, setAllPropertiesStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    dualPurpose: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      fetchProperties();
      fetchAllPropertiesStats();
    }
  }, [token, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [properties, statusFilter, availabilityFilter, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/properties?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Backend returns {data: [...], pagination: {...}}
        const data = result.data || result;
        const pagination = result.pagination;

        // Ensure data is an array
        setProperties(Array.isArray(data) ? data : []);

        // Set pagination info
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalItems(pagination.total || 0);
        }
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPropertiesStats = async () => {
    try {
      // Fetch all properties to calculate stats (we need all for accurate counts)
      const response = await fetch(`${API_BASE_URL}/admin/properties?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const allProps = result.data || [];

        setAllPropertiesStats({
          total: result.pagination?.total || allProps.length,
          pending: allProps.filter((p: Property) => p.status === 'pending').length,
          active: allProps.filter((p: Property) => p.status === 'active').length,
          dualPurpose: allProps.filter((p: Property) => p.availableFor?.rent && p.availableFor?.sale).length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'rent') {
        filtered = filtered.filter(p => p.availableFor?.rent);
      } else if (availabilityFilter === 'sale') {
        filtered = filtered.filter(p => p.availableFor?.sale);
      } else if (availabilityFilter === 'both') {
        filtered = filtered.filter(p => p.availableFor?.rent && p.availableFor?.sale);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.area.toLowerCase().includes(query) ||
        p.location.city.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  };

  const handleApprove = async (propertyId: string) => {
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
        fetchProperties(); // Refresh list
      }
    } catch (error) {
      console.error('Error approving property:', error);
    }
  };

  const handleReject = async (propertyId: string) => {
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
        fetchProperties(); // Refresh list
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
    }
  };

  const getAvailabilityBadge = (property: Property) => {
    if (property.availableFor?.rent && property.availableFor?.sale) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white">
          إيجار وبيع
        </span>
      );
    } else if (property.availableFor?.rent) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500 text-white">
          إيجار
        </span>
      );
    } else if (property.availableFor?.sale) {
      return (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
          بيع
        </span>
      );
    }
    return null;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      active: 'نشط',
      inactive: 'غير نشط',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }} dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: ds.colors.primary.black }}>
            إدارة العقارات
          </h1>
          <p className="text-gray-600">إدارة جميع العقارات والموافقة على الطلبات الجديدة</p>
        </div>
        <button
          onClick={() => router.push('/admin/properties/create')}
          className="px-6 py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
          إضافة عقار جديد
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1" style={{ color: ds.colors.primary.black }}>
            {allPropertiesStats.total}
          </div>
          <div className="text-sm text-gray-600">إجمالي العقارات</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-yellow-600">
            {allPropertiesStats.pending}
          </div>
          <div className="text-sm text-gray-600">قيد المراجعة</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {allPropertiesStats.active}
          </div>
          <div className="text-sm text-gray-600">نشط</div>
        </div>
        <div style={ds.components.glassCard} className="text-center">
          <div className="text-3xl font-bold mb-1 text-blue-600">
            {allPropertiesStats.dualPurpose}
          </div>
          <div className="text-sm text-gray-600">متاح للإيجار والبيع</div>
        </div>
      </div>

      {/* Filters */}
      <div style={ds.components.glassCard} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              بحث
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عقار..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد المراجعة</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: ds.colors.neutral.gray700 }}>
              التوافر
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">الكل</option>
              <option value="rent">إيجار فقط</option>
              <option value="sale">بيع فقط</option>
              <option value="both">إيجار وبيع</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div style={ds.components.glassCard}>
        <div className="mb-4 text-sm text-gray-600">
          عرض {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} من أصل {totalItems} عقار
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>العقار</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الموقع</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>المواصفات</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>التوافر</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>السعر</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: ds.colors.neutral.gray700 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    لا توجد عقارات
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {property.images?.[0] ? (
                            <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              لا صورة
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-1">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.propertyType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">{property.location.area}</div>
                      <div className="text-xs text-gray-500">{property.location.city}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm flex items-center gap-2">
                        <span>{property.specifications.bedrooms} غرف</span>
                        <span>•</span>
                        <span>{property.specifications.bathrooms} حمام</span>
                        <span>•</span>
                        <span>{property.specifications.areaSqm}م²</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getAvailabilityBadge(property)}
                    </td>
                    <td className="py-4 px-4">
                      {property.availableFor?.rent && property.availableFor?.sale ? (
                        <div className="text-sm">
                          <div className="text-blue-600 font-semibold">{property.availableFor.rentPrice?.toLocaleString()} ر.ق/شهر</div>
                          <div className="text-green-600 font-semibold">{property.availableFor.salePrice?.toLocaleString()} ر.ق</div>
                        </div>
                      ) : property.availableFor?.rent ? (
                        <div className="text-sm font-semibold">{property.availableFor.rentPrice?.toLocaleString()} ر.ق/شهر</div>
                      ) : property.availableFor?.sale ? (
                        <div className="text-sm font-semibold">{property.availableFor.salePrice?.toLocaleString()} ر.ق</div>
                      ) : (
                        <div className="text-sm font-semibold">{property.price?.toLocaleString()} ر.ق</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(property.status)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/properties/${property._id}`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => router.push(`/admin/properties/${property._id}/edit`)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          تعديل
                        </button>
                        {property.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(property._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleReject(property._id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأولى
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                السابقة
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                التالية
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأخيرة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
