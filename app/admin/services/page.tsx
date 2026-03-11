'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassTable, TableColumn } from '../components/ui/GlassTable';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassChip } from '../components/ui/GlassChip';
import { GlassModal } from '../components/ui/GlassModal';
import { GlassInput } from '../components/ui/GlassInput';
import {
  adminServicesService,
  Service,
  Technician,
  Appointment,
} from '../../../services/adminServicesService';

type TabType = 'services' | 'technicians';

export default function ServicesOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [loading, setLoading] = useState(false);

  // ========== SERVICES STATE ==========
  const [services, setServices] = useState<Service[]>([]);
  const [servicesStats, setServicesStats] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [availableTechnicians, setAvailableTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('');

  // ========== TECHNICIANS STATE ==========
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techniciansStats, setTechniciansStats] = useState<any>(null);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [technicianForm, setTechnicianForm] = useState({
    nameAr: '',
    nameEn: '',
    phone: '',
    email: '',
    specialization: 'ac' as 'furniture' | 'plumbing' | 'electrical' | 'ac',
    yearsOfExperience: 0,
    status: 'active' as 'active' | 'inactive' | 'busy',
  });

  // ========== LOAD DATA ==========
  useEffect(() => {
    if (activeTab === 'services') {
      loadServices();
      loadServiceStats();
    } else if (activeTab === 'technicians') {
      loadTechnicians();
      loadTechnicianStats();
    }
  }, [activeTab, serviceStatusFilter]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminServicesService.getServices({
        status: serviceStatusFilter || undefined,
        limit: 50,
      });
      setServices(data.services);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceStats = async () => {
    try {
      const stats = await adminServicesService.getServiceStats();
      setServicesStats(stats);
    } catch (error) {
      console.error('Error loading service stats:', error);
    }
  };

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const data = await adminServicesService.getTechnicians({ limit: 50 });
      setTechnicians(data.technicians);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicianStats = async () => {
    try {
      const stats = await adminServicesService.getTechnicianStats();
      setTechniciansStats(stats);
    } catch (error) {
      console.error('Error loading technician stats:', error);
    }
  };

  // ========== SERVICE ACTIONS ==========
  const handleAssignTechnician = async (service: Service) => {
    setSelectedService(service);
    setShowAssignModal(true);
    try {
      const techs = await adminServicesService.getAvailableTechnicians(service.serviceType);
      setAvailableTechnicians(techs);
    } catch (error) {
      console.error('Error loading available technicians:', error);
    }
  };

  const confirmAssignTechnician = async () => {
    if (!selectedService || !selectedTechnicianId) return;

    try {
      await adminServicesService.assignTechnician(selectedService._id, {
        technicianId: selectedTechnicianId,
      });
      setShowAssignModal(false);
      setSelectedTechnicianId('');
      loadServices();
      alert('تم تعيين الفني بنجاح');
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('حدث خطأ في تعيين الفني');
    }
  };

  const handleUpdateServiceStatus = async (serviceId: string, status: string) => {
    try {
      await adminServicesService.updateServiceStatus(serviceId, { status });
      loadServices();
      alert('تم تحديث حالة الخدمة');
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('حدث خطأ في تحديث الحالة');
    }
  };

  // ========== TECHNICIAN ACTIONS ==========
  const handleCreateTechnician = async () => {
    try {
      await adminServicesService.createTechnician(technicianForm);
      setShowTechnicianModal(false);
      setTechnicianForm({
        nameAr: '',
        nameEn: '',
        phone: '',
        email: '',
        specialization: 'ac',
        yearsOfExperience: 0,
        status: 'active',
      });
      loadTechnicians();
      alert('تم إضافة الفني بنجاح');
    } catch (error) {
      console.error('Error creating technician:', error);
      alert('حدث خطأ في إضافة الفني');
    }
  };

  const handleUpdateTechnicianStatus = async (id: string, status: string) => {
    try {
      await adminServicesService.updateTechnicianStatus(id, status);
      loadTechnicians();
      alert('تم تحديث حالة الفني');
    } catch (error) {
      console.error('Error updating technician status:', error);
      alert('حدث خطأ في تحديث الحالة');
    }
  };

  // ========== VIEW SERVICE DETAILS ==========
  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  // ========== RENDER METHODS ==========
  const getServiceStatusColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getServiceStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'معلق',
      in_progress: 'جاري العمل',
      completed: 'منتهي',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      furniture: 'صيانة الأثاث',
      plumbing: 'صيانة السباكة',
      electrical: 'صيانة الكهرباء',
      ac: 'صيانة التكييف',
    };
    return labels[type] || type;
  };

  const getSpecializationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      furniture: 'أثاث',
      plumbing: 'سباكة',
      electrical: 'كهرباء',
      ac: 'تكييف',
      other: 'أخرى',
    };
    return labels[spec] || spec;
  };

  const serviceColumns: TableColumn<Service>[] = [
    { key: 'requestDate', label: 'التاريخ', render: (s) => new Date(s.requestDate).toLocaleDateString('ar') },
    { key: 'title', label: 'العنوان' },
    { key: 'serviceType', label: 'النوع', render: (s) => getServiceTypeLabel(s.serviceType) },
    { key: 'user', label: 'المستخدم', render: (s) => s.userId?.fullName || '-' },
    {
      key: 'technician',
      label: 'الفني',
      render: (s) => (s.technicianId ? s.technicianId.nameAr : 'غير مُعين'),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (s) => (
        <GlassChip variant={getServiceStatusColor(s.status)}>
          {getServiceStatusLabel(s.status)}
        </GlassChip>
      ),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (s) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <GlassButton size="sm" variant="secondary" onClick={() => handleViewDetails(s)}>
            التفاصيل
          </GlassButton>
          {!s.technicianId && (
            <GlassButton size="sm" onClick={() => handleAssignTechnician(s)}>
              تعيين فني
            </GlassButton>
          )}
          {s.status === 'pending' && (
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => handleUpdateServiceStatus(s._id, 'in_progress')}
            >
              بدء العمل
            </GlassButton>
          )}
          {s.status === 'in_progress' && (
            <GlassButton
              size="sm"
              variant="success"
              onClick={() => handleUpdateServiceStatus(s._id, 'completed')}
            >
              إنهاء
            </GlassButton>
          )}
        </div>
      ),
    },
  ];

  const technicianColumns: TableColumn<Technician>[] = [
    { key: 'nameAr', label: 'الاسم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'specialization', label: 'التخصص', render: (t) => getSpecializationLabel(t.specialization) },
    { key: 'yearsOfExperience', label: 'سنوات الخبرة' },
    { key: 'currentJobs', label: 'المهام الحالية' },
    { key: 'completedJobs', label: 'المهام المنجزة' },
    {
      key: 'status',
      label: 'الحالة',
      render: (t) => (
        <GlassChip variant={t.status === 'active' ? 'success' : t.status === 'busy' ? 'warning' : 'default'}>
          {t.status === 'active' ? 'نشط' : t.status === 'busy' ? 'مشغول' : 'غير نشط'}
        </GlassChip>
      ),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (t) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {t.status === 'active' && (
            <GlassButton size="sm" onClick={() => handleUpdateTechnicianStatus(t._id, 'inactive')}>
              تعطيل
            </GlassButton>
          )}
          {t.status === 'inactive' && (
            <GlassButton size="sm" variant="primary" onClick={() => handleUpdateTechnicianStatus(t._id, 'active')}>
              تفعيل
            </GlassButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div dir="rtl" style={{ padding: '24px', fontFamily: 'Tajawal, sans-serif' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: 0 }}>
          الخدمات والصيانة
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', marginTop: '8px' }}>
          إدارة طلبات الخدمات والفنيين
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <button
          onClick={() => setActiveTab('services')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'services' ? 'linear-gradient(135deg, #D4C5B0, #C4B5A0)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(212, 197, 176, 0.3)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: activeTab === 'services' ? 700 : 400,
            color: activeTab === 'services' ? '#000' : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          طلبات الخدمات {servicesStats && `(${servicesStats.total})`}
        </button>
        <button
          onClick={() => setActiveTab('technicians')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'technicians' ? 'linear-gradient(135deg, #D4C5B0, #C4B5A0)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(212, 197, 176, 0.3)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: activeTab === 'technicians' ? 700 : 400,
            color: activeTab === 'technicians' ? '#000' : '#6B7280',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          الفنيون {techniciansStats && `(${techniciansStats.total})`}
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'services' && servicesStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <GlassCard>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>معلقة</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#F59E0B' }}>{servicesStats.pending}</div>
          </GlassCard>
          <GlassCard>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>جارية</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#3B82F6' }}>{servicesStats.inProgress}</div>
          </GlassCard>
          <GlassCard>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>منتهية</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10B981' }}>{servicesStats.completed}</div>
          </GlassCard>
          <GlassCard>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>غير مُعيّن فني</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#EF4444' }}>{servicesStats.unassigned}</div>
          </GlassCard>
        </div>
      )}

      {/* Content */}
      <GlassCard>
        {activeTab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                طلبات الخدمات
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={serviceStatusFilter}
                  onChange={(e) => setServiceStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(212, 197, 176, 0.4)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Tajawal, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">جميع الحالات</option>
                  <option value="pending">معلقة</option>
                  <option value="in_progress">جارية</option>
                  <option value="completed">منتهية</option>
                  <option value="cancelled">ملغية</option>
                </select>
              </div>
            </div>
            <GlassTable
              columns={serviceColumns}
              data={services}
              keyExtractor={(s) => s._id}
              loading={loading}
              emptyMessage="لا توجد طلبات خدمات"
            />
          </div>
        )}

        {activeTab === 'technicians' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                إدارة الفنيين
              </h2>
              <GlassButton variant="primary" onClick={() => setShowTechnicianModal(true)}>
                + إضافة فني جديد
              </GlassButton>
            </div>
            <GlassTable
              columns={technicianColumns}
              data={technicians}
              keyExtractor={(t) => t._id}
              loading={loading}
              emptyMessage="لا يوجد فنيون"
            />
          </div>
        )}
      </GlassCard>

      {/* Assign Technician Modal */}
      <GlassModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="تعيين فني للطلب"
        footer={
          <>
            <GlassButton onClick={() => setShowAssignModal(false)}>إلغاء</GlassButton>
            <GlassButton variant="primary" onClick={confirmAssignTechnician} disabled={!selectedTechnicianId}>
              تعيين
            </GlassButton>
          </>
        }
      >
        {selectedService && (
          <div>
            <p style={{ marginBottom: '16px', color: '#6B7280' }}>
              نوع الخدمة: <strong>{getServiceTypeLabel(selectedService.serviceType)}</strong>
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                اختر الفني:
              </label>
              {availableTechnicians.length === 0 ? (
                <p style={{ color: '#EF4444' }}>لا يوجد فنيون متاحون لهذا النوع من الخدمة</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableTechnicians.map((tech) => (
                    <div
                      key={tech._id}
                      onClick={() => setSelectedTechnicianId(tech._id)}
                      style={{
                        padding: '16px',
                        background: selectedTechnicianId === tech._id ? 'rgba(212, 197, 176, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                        border: `2px solid ${selectedTechnicianId === tech._id ? '#D4C5B0' : 'rgba(212, 197, 176, 0.3)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                        {tech.nameAr}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>
                        الهاتف: {tech.phone} | المهام الحالية: {tech.currentJobs} | التقييم:{' '}
                        {tech.averageRating ? `${tech.averageRating.toFixed(1)} ⭐` : 'لا يوجد'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassModal>

      {/* Create Technician Modal */}
      <GlassModal
        isOpen={showTechnicianModal}
        onClose={() => setShowTechnicianModal(false)}
        title="إضافة فني جديد"
        footer={
          <>
            <GlassButton onClick={() => setShowTechnicianModal(false)}>إلغاء</GlassButton>
            <GlassButton variant="primary" onClick={handleCreateTechnician}>
              إضافة
            </GlassButton>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GlassInput
            label="الاسم بالعربية"
            value={technicianForm.nameAr}
            onChange={(e) => setTechnicianForm({ ...technicianForm, nameAr: e.target.value })}
            placeholder="أدخل الاسم بالعربية"
          />
          <GlassInput
            label="الاسم بالإنجليزية"
            value={technicianForm.nameEn}
            onChange={(e) => setTechnicianForm({ ...technicianForm, nameEn: e.target.value })}
            placeholder="Enter name in English"
          />
          <GlassInput
            label="رقم الهاتف"
            value={technicianForm.phone}
            onChange={(e) => setTechnicianForm({ ...technicianForm, phone: e.target.value })}
            placeholder="+974xxxxxxxx"
          />
          <GlassInput
            label="البريد الإلكتروني (اختياري)"
            value={technicianForm.email}
            onChange={(e) => setTechnicianForm({ ...technicianForm, email: e.target.value })}
            placeholder="email@example.com"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              التخصص
            </label>
            <select
              value={technicianForm.specialization}
              onChange={(e) =>
                setTechnicianForm({
                  ...technicianForm,
                  specialization: e.target.value as any,
                })
              }
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 197, 176, 0.4)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Tajawal, sans-serif',
              }}
            >
              <option value="furniture">صيانة الأثاث</option>
              <option value="plumbing">صيانة السباكة</option>
              <option value="electrical">صيانة الكهرباء</option>
              <option value="ac">صيانة التكييف</option>
            </select>
          </div>
          <GlassInput
            label="سنوات الخبرة"
            type="number"
            value={technicianForm.yearsOfExperience.toString()}
            onChange={(e) =>
              setTechnicianForm({ ...technicianForm, yearsOfExperience: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>
      </GlassModal>

      {/* Service Details Modal */}
      <GlassModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="تفاصيل الطلب"
      >
        {selectedService && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Service Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                معلومات الطلب
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>رقم الطلب:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService._id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>العنوان:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>نوع الخدمة:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{getServiceTypeLabel(selectedService.serviceType)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>الحالة:</span>
                  <GlassChip variant={getServiceStatusColor(selectedService.status)}>
                    {getServiceStatusLabel(selectedService.status)}
                  </GlassChip>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>تاريخ الطلب:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>
                    {new Date(selectedService.requestDate).toLocaleDateString('ar-SA')}
                    {' - '}
                    {new Date(selectedService.requestDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {selectedService.scheduledDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>موعد الزيارة المحدد:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#3B82F6' }}>
                      {new Date(selectedService.scheduledDate).toLocaleDateString('ar-SA')}
                      {' - '}
                      {new Date(selectedService.scheduledDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {selectedService.completionDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>تاريخ الإنجاز:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#10B981' }}>
                      {new Date(selectedService.completionDate).toLocaleDateString('ar-SA')}
                      {' - '}
                      {new Date(selectedService.completionDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                معلومات العميل
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>الاسم:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.userId?.fullName || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>الهاتف:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.userId?.phone || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                  <span style={{ color: '#6B7280', fontSize: '14px' }}>البريد الإلكتروني:</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.userId?.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Property Info */}
            {selectedService.propertyId && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                  معلومات العقار
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>العنوان:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.propertyId.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>الموقع:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.propertyId.location}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Technician Info */}
            {selectedService.technicianId && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                  معلومات الفني
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>الاسم:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.technicianId.nameAr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>الهاتف:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.technicianId.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>التخصص:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{getSpecializationLabel(selectedService.technicianId.specialization)}</span>
                  </div>
                  {selectedService.technicianId.averageRating && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                      <span style={{ color: '#6B7280', fontSize: '14px' }}>التقييم:</span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.technicianId.averageRating.toFixed(1)} ⭐</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                الوصف
              </h3>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', padding: '12px', background: 'rgba(212, 197, 176, 0.1)', borderRadius: '8px' }}>
                {selectedService.description || 'لا يوجد وصف'}
              </p>
            </div>

            {/* Cost */}
            {(selectedService.estimatedCost || selectedService.cost) && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                  التكلفة
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedService.estimatedCost && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                      <span style={{ color: '#6B7280', fontSize: '14px' }}>التكلفة المتوقعة:</span>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#F59E0B' }}>{selectedService.estimatedCost} ر.ق</span>
                    </div>
                  )}
                  {selectedService.cost && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                      <span style={{ color: '#6B7280', fontSize: '14px' }}>التكلفة النهائية:</span>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#10B981' }}>{selectedService.cost} ر.ق</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {selectedService.images && selectedService.images.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                  الصور
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {selectedService.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`صورة ${index + 1}`}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212, 197, 176, 0.3)' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Feedback */}
            {(selectedService.rating || selectedService.feedback) && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
                  التقييم والملاحظات
                </h3>
                {selectedService.rating && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(212, 197, 176, 0.2)' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>التقييم:</span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{selectedService.rating} ⭐</span>
                  </div>
                )}
                {selectedService.feedback && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ color: '#6B7280', fontSize: '14px', display: 'block', marginBottom: '8px' }}>الملاحظات:</span>
                    <p style={{ color: '#111827', fontSize: '14px', lineHeight: '1.6', padding: '12px', background: 'rgba(212, 197, 176, 0.1)', borderRadius: '8px' }}>
                      {selectedService.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
}
