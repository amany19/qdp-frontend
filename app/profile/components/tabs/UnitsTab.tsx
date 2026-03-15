'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Contract } from '@/types/profile';
import { Calendar, Home, MapPin, FileText } from 'lucide-react';
import ContractReminderCard from '../ContractReminderCard';
import UnitFeaturesStrip from '@/components/ui/UnitFeaturesStrip';
import CommitmentRewardCard from '@/components/ui/CommitmentRewardCard';

interface UnitsTabProps {
  contracts: Contract[];
  loading: boolean;
  userType?: string;
}

export default function UnitsTab({ contracts, loading, userType }: UnitsTabProps) {
  const router = useRouter();
  const isResident = userType === 'resident';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-gray-500">لا توجد عقود حتى الآن</p>
        <button
          onClick={() => router.push(isResident ? '/my-unit' : '/my-bookings')}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors"
        >
          <FileText className="w-5 h-5" />
          {isResident ? 'عرض وحدتي' : 'حجوزاتي والأقساط'}
        </button>
      </div>
    );
  }

  // Find the first active or pending_signature contract
  const activeContract = contracts.find(c => c.status === 'active' || c.status === 'pending_signature');
  const contract = activeContract || contracts[0];

  // Check if property data is populated
  if (!contract.propertyId) {
    return <ContractMissingData contract={contract} />;
  }

  // Calculate days until contract expiry
  const endDate = contract.endDate ? new Date(contract.endDate) : null;
  const today = new Date();
  const daysUntilExpiry = endDate
    ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  const showWarning = daysUntilExpiry <= 30 && contract.contractType === 'rent';

  // Mock payment data (TODO: Get from payments API)
  const paymentsOnTime = 5;
  const totalPayments = 6;

  return (
    <div className="space-y-6">
      {/* Contract Expiry Warning */}
      {true && (
       <ContractReminderCard daysRemaining={15} contractId={contract._id} userType={userType} />
      )}
      {/* Commitment Reward - same styling as my-unit page */}
      <CommitmentRewardCard paymentsOnTime={paymentsOnTime} totalPayments={totalPayments} />

      {/* Unit Details Section */}
      <UnitDetails contract={contract} />

      {/* Link: residents go to وحدتي, normal users to حجوزاتي */}
      <div className="pt-2 space-y-2">
        <button
          onClick={() => router.push(isResident ? '/my-unit' : '/my-bookings')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors"
        >
          <FileText className="w-5 h-5" />
          {isResident ? 'عرض وحدتي' : 'حجوزاتي والأقساط'}
        </button>
        {isResident && (
          <button
            onClick={() => router.push('/my-transfers')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors"
          >
            طلبات النقل والاستبدال
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-components for UnitsTab

function ContractMissingData({ contract }: { contract: Contract }) {
  return (
    <div className="text-center py-12">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-sm mx-auto">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-base font-bold text-gray-900 mb-2">
          بيانات العقار غير متوفرة
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          العقد موجود ولكن لم يتم ربطه بعقار بعد. يرجى التواصل مع الدعم.
        </p>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-right">
          <div className="space-y-2">
            <ContractInfoRow label="رقم العقد" value={contract.contractNumber || contract._id.slice(-8)} />
            <ContractInfoRow 
              label="نوع العقد" 
              value={contract.contractType === 'rent' ? 'إيجار' : 'بيع'} 
            />
            <ContractInfoRow 
              label="القيمة" 
              value={`${contract.amount.toLocaleString('ar-QA')} ريال`} 
            />
            <ContractInfoRow 
              label="الحالة" 
              value={getStatusText(contract.status)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}


function PaymentDueSection({ isResident }: { isResident: boolean }) {
  const router = useRouter();

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-3">
        الدفع خلال 15 يوم
      </h3>
      <button
        onClick={() => router.push(isResident ? '/my-unit' : '/my-bookings')}
        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        ادفع الآن
      </button>
    </div>
  );
}

function UnitDetails({ contract }: { contract: Contract }) {
  const prop = contract.propertyId as { _id?: string; titleAr?: string; title?: string; specifications?: { areaSqm?: number; bedrooms?: number; bathrooms?: number; kitchen?: number } };
  const unitTitle = prop?.titleAr || prop?.title || (prop?._id ? String(prop._id).slice(-4) : '—');
  const specs = prop?.specifications;

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-3">تفاصيل الوحدة</h3>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <UnitFeaturesStrip
          unitTitle={unitTitle}
          kitchenLabel={specs?.kitchen != null ? `${specs.kitchen} مطبخ` : '1 مطبخ'}
          bathroomsLabel={specs?.bathrooms != null ? `${specs.bathrooms} حمام` : 'حمام'}
          bedroomsLabel={specs?.bedrooms != null ? `${specs.bedrooms} غرف` : 'غرف'}
          areaLabel={specs?.areaSqm != null ? `${specs.areaSqm} م²` : 'م²'}
        />

        {/* Contract Details */}
        <div className="space-y-2 pt-3 border-t border-gray-100">
          <DetailRow 
            label="نوع العقد" 
            value={contract.contractType === 'rent' ? 'إيجار' : 'بيع'} 
          />
          <DetailRow 
            label="القيمة الشهرية" 
            value={`${contract.amount.toLocaleString('ar-QA')} ريال`} 
          />
          <DetailRow 
            label="الموقع" 
            value={`${contract.propertyId.location.area}, ${contract.propertyId.location.city}`} 
          />
          <DetailRow 
            label="تاريخ البداية" 
            value={new Date(contract.startDate).toLocaleDateString('ar-QA')} 
          />
          {contract.endDate && (
            <DetailRow 
              label="تاريخ الانتهاء" 
              value={new Date(contract.endDate).toLocaleDateString('ar-QA')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'pending_signature':
      return 'بانتظار التوقيع';
    case 'draft':
      return 'مسودة';
    default:
      return status;
  }
}