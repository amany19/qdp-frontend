'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';
import { API_BASE_URL, SERVER_BASE_URL } from '@/lib/config';
import type { Partner } from '@/types/partner';

export default function AdminPartnersPage() {
  const { token } = useAdminAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    website: '',
    email: '',
    phone: '',
    isActive: true,
  });

  const fetchPartners = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      } else {
        setPartners([]);
      }
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      logoUrl: '',
      website: '',
      email: '',
      phone: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (partner: Partner) => {
    setEditingId(partner._id);
    setForm({
      name: partner.name ?? '',
      logoUrl: partner.logoUrl ?? '',
      website: partner.website ?? '',
      email: partner.email ?? '',
      phone: partner.phone ?? '',
      isActive: partner.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, logoUrl: data.url || '' }));
      }
    } catch {
      // ignore
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const logoDisplayUrl = form.logoUrl && (form.logoUrl.startsWith('http') ? form.logoUrl : `${SERVER_BASE_URL}${form.logoUrl}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/partners/${editingId}`
        : `${API_BASE_URL}/admin/partners`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchPartners();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'فشل الحفظ');
      }
    } catch {
      alert('فشل الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('حذف هذا الشريك؟')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/partners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPartners();
      else alert('فشل الحذف');
    } catch {
      alert('فشل الحذف');
    }
  };

  return (
    <div dir="rtl" style={{ padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>الشركاء</h1>
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
          إضافة شريك
        </button>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : partners.length === 0 ? (
        <div style={{ background: '#fff', padding: '48px', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
          لا يوجد شركاء. اضغط &quot;إضافة شريك&quot; لإنشاء أول شريك.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {partners.map((partner) => (
            <div
              key={partner._id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {partner.logoUrl && (
                  <img
                    src={partner.logoUrl.startsWith('http') ? partner.logoUrl : `${SERVER_BASE_URL}${partner.logoUrl}`}
                    alt=""
                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>{partner.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    {partner.website && partner.website}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: partner.isActive ? '#d1fae5' : '#fee2e2',
                      color: partner.isActive ? '#065f46' : '#991b1b',
                    }}
                  >
                    {partner.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => openEdit(partner)}
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
                  onClick={() => handleDelete(partner._id)}
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
              {editingId ? 'تعديل الشريك' : 'إضافة شريك'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الاسم</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الشعار (اختياري)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="رابط الصورة"
                    value={form.logoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>أو</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ fontSize: '14px' }}
                    />
                    {logoUploading && <span style={{ fontSize: '12px', color: '#6b7280' }}>جاري الرفع...</span>}
                  </div>
                  {form.logoUrl && (
                    <img
                      src={logoDisplayUrl}
                      alt=""
                      style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                  )}
                </div>
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الموقع</span>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>البريد الإلكتروني</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>الهاتف</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
