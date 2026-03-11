'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePropertyDraftStore } from '@/store/propertyDraftStore';


export default function AddPropertyStep1() {
  const router = useRouter();
  const { images, addImages, removeImage } = usePropertyDraftStore();

  const [formData, setFormData] = useState({
    city: '',
    propertyType: 'apartment',
    title: '',
    description: '',
    rooms: 3,
    bathrooms: 2,
    availableForRent: false,
    availableForSale: true,
    rentPrice: '',
    salePrice: '',
    contractDuration: '12',
    numberOfInstallments: '12',
    insuranceDeposit: '',
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const propertyTypes = [
    { value: 'apartment', label: 'شقة' },
    { value: 'villa', label: 'فيلا' },
    { value: 'office', label: 'مكتب' },
    { value: 'land', label: 'أرض' },
    { value: 'warehouse', label: 'مستودع' },
    { value: 'showroom', label: 'صالة عرض' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 20) {
      toast.error('الحد الأقصى هو 20 صورة');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    
    // Store in Zustand
    addImages(files);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    removeImage(index);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContinue = () => {
    // Validations
    if (!formData.city.trim()) {
      toast.error('الرجاء إدخال المدينة');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('الرجاء إدخال عنوان العقار');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('الرجاء إدخال وصف العقار');
      return;
    }
    if (!formData.availableForRent && !formData.availableForSale) {
      toast.error('الرجاء اختيار نوع العرض');
      return;
    }
    if (formData.availableForRent && !formData.rentPrice.trim()) {
      toast.error('الرجاء إدخال سعر الإيجار');
      return;
    }
    if (formData.availableForSale && !formData.salePrice.trim()) {
      toast.error('الرجاء إدخال سعر البيع');
      return;
    }
    if (formData.availableForRent && !formData.insuranceDeposit.trim()) {
      toast.error('الرجاء إدخال مبلغ التأمين');
      return;
    }
    if (images.length === 0) {
      toast.error('الرجاء إضافة صورة واحدة على الأقل');
      return;
    }

    // Determine category
    const category = formData.availableForRent && formData.availableForSale ? 'both' : 
                    formData.availableForRent ? 'rent' : 'sale';

    // Store text data in sessionStorage
    const step1Data = {
      city: formData.city,
      propertyType: formData.propertyType,
      category: category,
      title: formData.title,
      description: formData.description,
      rooms: formData.rooms,
      bathrooms: formData.bathrooms,
      availableFor: {
        rent: formData.availableForRent,
        sale: formData.availableForSale,
        ...(formData.availableForRent && {
          rentPrice: parseFloat(formData.rentPrice),
          contractDuration: parseInt(formData.contractDuration),
          numberOfInstallments: parseInt(formData.numberOfInstallments),
          insuranceDeposit: parseFloat(formData.insuranceDeposit),
        }),
        ...(formData.availableForSale && {
          salePrice: parseFloat(formData.salePrice),
        }),
      },
    };
    
    sessionStorage.setItem('addPropertyStep1', JSON.stringify(step1Data));
    router.push('/add-property/step-2');
  };

  return (
    <div className="min-h-screen bg-white pb-32" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => router.push('/home')} className="p-2">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">اضافة اعلان</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div className="w-20 h-0.5 bg-gray-300"></div>
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <div className="w-20 h-0.5 bg-gray-300"></div>
            <div className="w-4 h-4 rounded-full bg-black"></div>
          </div>
          <p className="text-center text-sm text-gray-500">المدينة</p>
        </div>

        {/* Property Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-right">نوع العقار</label>
          <select
            value={formData.propertyType}
            onChange={(e) => updateField('propertyType', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
          >
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Availability Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-right">نوع العرض المتاح</label>
          <div className="space-y-3">
            <label className="flex items-center justify-end gap-3 p-4 border-2 rounded-lg cursor-pointer">
              <span>متاح للإيجار</span>
              <input
                type="checkbox"
                checked={formData.availableForRent}
                onChange={(e) => updateField('availableForRent', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-end gap-3 p-4 border-2 rounded-lg cursor-pointer">
              <span>متاح للبيع</span>
              <input
                type="checkbox"
                checked={formData.availableForSale}
                onChange={(e) => updateField('availableForSale', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
        </div>

        {/* City */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-right">المدينة</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="الدوحة"
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
          />
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-right">عنوان العقار</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="شقة فاخرة في الدوحة"
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-right">وصف العقار</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border rounded-lg text-right"
          />
        </div>

        {/* Rooms */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-right">عدد الغرف</label>
          <div className="flex gap-2 justify-end">
            {[5,4,3,2,1].map(num => (
              <button
                key={num}
                onClick={() => updateField('rooms', num)}
                className={`w-16 h-16 rounded-lg border-2 ${
                  formData.rooms === num ? 'bg-black text-white border-black' : 'border-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-right">عدد الحمامات</label>
          <div className="flex gap-2 justify-end">
            {[2,1].map(num => (
              <button
                key={num}
                onClick={() => updateField('bathrooms', num)}
                className={`w-16 h-16 rounded-lg border-2 ${
                  formData.bathrooms === num ? 'bg-black text-white border-black' : 'border-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-right">صور العقار</label>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">{images.length}/20 صورة</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Rent Details */}
        {formData.availableForRent && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-4">تفاصيل الإيجار</h3>
            <input
              type="number"
              value={formData.rentPrice}
              onChange={(e) => updateField('rentPrice', e.target.value)}
              placeholder="السعر الشهري"
              className="w-full px-4 py-3 bg-white border rounded-lg mb-3"
            />
            <select
              value={formData.contractDuration}
              onChange={(e) => {
                updateField('contractDuration', e.target.value);
                updateField('numberOfInstallments', e.target.value);
              }}
              className="w-full px-4 py-3 bg-white border rounded-lg mb-3"
            >
              <option value="6">6 أشهر</option>
              <option value="12">12 شهر</option>
              <option value="24">24 شهر</option>
            </select>
            <input
              type="number"
              value={formData.insuranceDeposit}
              onChange={(e) => updateField('insuranceDeposit', e.target.value)}
              placeholder="مبلغ التأمين"
              className="w-full px-4 py-3 bg-white border rounded-lg"
            />
          </div>
        )}

        {/* Sale Details */}
        {formData.availableForSale && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-4">تفاصيل البيع</h3>
            <input
              type="number"
              value={formData.salePrice}
              onChange={(e) => updateField('salePrice', e.target.value)}
              placeholder="سعر البيع"
              className="w-full px-4 py-3 bg-white border rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-5">
        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 rounded-lg font-medium"
        >
          متابعة
        </button>
      </div>
    </div>
  );
}