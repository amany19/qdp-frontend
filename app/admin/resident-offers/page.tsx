'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { API_BASE_URL } from '@/lib/config';
import type { ResidentOffer } from '@/types/residentOffer';
import type { Partner } from '@/types/partner';

export default function AdminResidentOffersPage() {
  const { token } = useAdminAuthStore();
  const [offers, setOffers] = useState<ResidentOffer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    partnerId: '',
    title: '',
    description: '',
    discountText: '',
    validUntil: '',
    actionUrl: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });

  const fetchOffers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/resident-offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      } else {
        setOffers([]);
      }
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch {
      setPartners([]);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchPartners();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      partnerId: partners.length ? partners[0]._id : '',
      title: '',
      description: '',
      discountText: '',
      validUntil: '',
      actionUrl: '',
      imageUrl: '',
      isActive: true,
      order: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (offer: ResidentOffer) => {
    setEditingId(offer._id);
    const partnerId = typeof offer.partnerId === 'object' && offer.partnerId && '_id' in offer.partnerId
      ? (offer.partnerId as { _id: string })._id
      : (offer.partnerId as string) || '';
    setForm({
      partnerId,
      title: offer.title ?? '',
      description: offer.description ?? '',
      discountText: offer.discountText ?? '',
      validUntil: offer.validUntil ? offer.validUntil.slice(0, 10) : '',
      actionUrl: offer.actionUrl ?? '',
      imageUrl: offer.imageUrl ?? '',
      isActive: offer.isActive ?? true,
      order: offer.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const payload = {
      ...form,
      validUntil: form.validUntil || undefined,
    };
    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/resident-offers/${editingId}`
        : `${API_BASE_URL}/admin/resident-offers`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchOffers();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'فشل الحفظ');
      }
    } catch (err) {
      alert('فشل الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('حذف هذا العرض؟')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/resident-offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchOffers();
      else alert('فشل الحذف');
    } catch {
      alert('فشل الحذف');
    }
  };

  return (
    <div dir="rtl" style={{ padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>عروض المقيمين</h1>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: '10px 20px',
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          إضافة عرض
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : offers.length === 0 ? (
        <div style={{ background: '#fff', padding: '48px', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
          لا توجد عروض. اضغط &quot;إضافة عرض&quot; لإنشاء أول عرض.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {offers.map((offer) => (
            <div
              key={offer._id}
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>
                  {offer.title}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  {offer.partner ? offer.partner.name : (typeof offer.partnerId === 'string' ? offer.partnerId : '—')} · {offer.discountText}
                </div>
                {offer.validUntil && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    صالح حتى: {new Date(offer.validUntil).toLocaleDateString('ar-QA')}
                  </div>
                )}
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: offer.isActive ? '#d1fae5' : '#fee2e2',
                    color: offer.isActive ? '#065f46' : '#991b1b',
                  }}
                >
                  {offer.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => openEdit(offer)}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(offer._id)}
                  style={{
                    padding: '8px 16px',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '24px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 700 }}>
              {editingId ? 'تعديل العرض' : 'إضافة عرض'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الشريك</span>
                <select
                  value={form.partnerId}
                  onChange={(e) => setForm((f) => ({ ...f, partnerId: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="">— اختر الشريك —</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {partners.length === 0 && (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>أضف شركاء من صفحة الشركاء أولاً.</span>
                )}
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>العنوان</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الوصف</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>رابط الصورة (اختياري)</span>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>نص الخصم</span>
                <input
                  type="text"
                  value={form.discountText}
                  onChange={(e) => setForm((f) => ({ ...f, discountText: e.target.value }))}
                  required
                  placeholder="e.g. 20% off"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>صالح حتى</span>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>رابط (اختياري)</span>
                <input
                  type="url"
                  value={form.actionUrl}
                  onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <span style={{ fontWeight: 500 }}>نشط</span>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>ترتيب (رقم)</span>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
