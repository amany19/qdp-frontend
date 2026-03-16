'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { API_BASE_URL, getUploadImageUrl } from '@/lib/config';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface PendingListing {
  _id: string;
  status: string;
  adDuration: string;
  totalCost: number;
  isPaid: boolean;
  createdAt: string;
  applianceId: {
    _id: string;
    nameAr: string;
    nameEn?: string;
    brand?: string;
    applianceType?: string;
    images?: string[];
  };
  userId?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
}

export default function AdminDeviceAdsPage() {
  const { token } = useAdminAuthStore();
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const fetchListings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/appliances/listings/pending-approval`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      } else {
        setListings([]);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [token]);

  const handleApprove = async (listingId: string) => {
    if (!token) return;
    setActingId(listingId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/appliances/listings/${listingId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        toast.success('تم اعتماد الإعلان');
        await fetchListings();
      } else {
        const err = await res.json();
        toast.error(err.message || 'فشل الاعتماد');
      }
    } catch (e: any) {
      toast.error(e?.message || 'فشل الاعتماد');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (listingId: string) => {
    if (!token) return;
    setActingId(listingId);
    const reason = rejectReason[listingId] || '';
    try {
      const res = await fetch(`${API_BASE_URL}/admin/appliances/listings/${listingId}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        toast.success('تم رفض الإعلان');
        setRejectReason((prev) => ({ ...prev, [listingId]: '' }));
        await fetchListings();
      } else {
        const err = await res.json();
        toast.error(err.message || 'فشل الرفض');
      }
    } catch (e: any) {
      toast.error(e?.message || 'فشل الرفض');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div style={{ padding: '24px', direction: 'rtl', textAlign: 'right' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
          اعتماد إعلانات الأجهزة
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          إعلانات الأجهزة المدفوعة والتي تنتظر الموافقة. بعد الاعتماد تظهر في قائمة الأجهزة للإيجار.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#D9D1BE',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : listings.length === 0 ? (
        <div
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            color: '#6B7280',
            border: '1px solid rgba(229,231,235,0.5)',
          }}
        >
          <p style={{ fontSize: '16px', margin: 0 }}>لا توجد إعلانات أجهزة بانتظار الاعتماد</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {listings.map((listing) => {
            const app = listing.applianceId;
            const nameAr = app?.nameAr ?? 'جهاز';
            const imageUrl = app?.images?.[0] ? getUploadImageUrl(app.images[0]) : '';
            const user = listing.userId;
            const isActing = actingId === listing._id;

            return (
              <div
                key={listing._id}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '16px',
                  border: '1px solid rgba(229,231,235,0.5)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '20px',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '120px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#F3F4F6',
                    flexShrink: 0,
                  }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={nameAr}
                      width={120}
                      height={100}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9CA3AF',
                        fontSize: '12px',
                      }}
                    >
                      لا صورة
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>
                    {nameAr}
                  </h3>
                  {user && (
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px 0' }}>
                      المعلن: {user.fullName || '—'} {user.phone && ` • ${user.phone}`}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    المدة: {listing.adDuration} • التكلفة: {listing.totalCost} ر.ق
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="text"
                      placeholder="سبب الرفض (اختياري)"
                      value={rejectReason[listing._id] ?? ''}
                      onChange={(e) =>
                        setRejectReason((prev) => ({ ...prev, [listing._id]: e.target.value }))
                      }
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '8px 12px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprove(listing._id)}
                    disabled={isActing}
                    style={{
                      padding: '10px 20px',
                      background: '#10B981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: isActing ? 'not-allowed' : 'pointer',
                      opacity: isActing ? 0.7 : 1,
                    }}
                  >
                    {isActing ? 'جاري...' : 'اعتماد'}
                  </button>
                  <button
                    onClick={() => handleReject(listing._id)}
                    disabled={isActing}
                    style={{
                      padding: '10px 20px',
                      background: '#EF4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: isActing ? 'not-allowed' : 'pointer',
                      opacity: isActing ? 0.7 : 1,
                    }}
                  >
                    رفض
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
