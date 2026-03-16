'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/auth/RoleGuard';
import HeaderCard from '@/components/ui/HeaderCard';
import { useDeviceDraftStore } from '@/store/deviceDraftStore';

const applianceTypes = [
  { value: 'refrigerator', label: 'ثلاجة' },
  { value: 'tv', label: 'تلفزيون' },
  { value: 'washing_machine', label: 'غسالة' },
  { value: 'ac', label: 'مكيف' },
  { value: 'oven', label: 'فرن' },
  { value: 'microwave', label: 'ميكروويف' },
  { value: 'dishwasher', label: 'غسالة صحون' },
];

const MAX_IMAGES = 10;

export default function AddDeviceStep1Page() {
  const router = useRouter();
  const { images, addImages, removeImage } = useDeviceDraftStore();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nameAr: '',
    applianceType: 'refrigerator',
    brand: '',
    model: '',
    color: '',
    descriptionAr: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (images.length > 0 && imagePreviews.length === 0) {
      setImagePreviews(images.map((f) => URL.createObjectURL(f)));
    }
  }, [images.length]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    const toAdd = files.slice(0, remaining);
    if (toAdd.length < files.length) toast.error(`تم إضافة ${toAdd.length} فقط. الحد الأقصى ${MAX_IMAGES} صور`);
    const newPreviews = toAdd.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    addImages(toAdd);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    removeImage(index);
  };

  const handleContinue = () => {
    if (!formData.nameAr.trim()) {
      toast.error('الرجاء إدخال اسم الجهاز');
      return;
    }
    if (!formData.brand.trim()) {
      toast.error('الرجاء إدخال العلامة التجارية');
      return;
    }
    if (!formData.descriptionAr.trim()) {
      toast.error('الرجاء إدخال وصف الجهاز');
      return;
    }
    sessionStorage.setItem('addDeviceStep1', JSON.stringify(formData));
    router.push('/add-device/step-2');
  };

  return (
    <RoleGuard allowedRoles={['user', 'resident']}>
      <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
        <HeaderCard
          title="إضافة جهاز - الخطوة ١"
          leftButton={
            <button  onClick={() => router.push('/appliances')}className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          }
        />
        <div className="px-5 py-6">
          {/* Image upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">صور الجهاز</label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <Image src={preview} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 left-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-right">{images.length}/{MAX_IMAGES} صورة</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">اسم الجهاز *</label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => updateField('nameAr', e.target.value)}
              placeholder="مثال: ثلاجة سامسونج"
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">نوع الجهاز</label>
            <select
              value={formData.applianceType}
              onChange={(e) => updateField('applianceType', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            >
              {applianceTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">العلامة التجارية *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => updateField('brand', e.target.value)}
              placeholder="مثال: Samsung"
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">الموديل</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => updateField('model', e.target.value)}
              placeholder="اختياري"
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">اللون</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="اختياري"
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-right">الوصف *</label>
            <textarea
              value={formData.descriptionAr}
              onChange={(e) => updateField('descriptionAr', e.target.value)}
              placeholder="وصف الجهاز وحالته"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
            />
          </div>
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-black text-white rounded-lg font-medium"
          >
            متابعة
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}
