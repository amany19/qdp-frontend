'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Contract } from '@/types/profile';
import { Gift, Calendar, Home, MapPin } from 'lucide-react';
import ContractReminderCard from '../ContractReminderCard';

interface UnitsTabProps {
  contracts: Contract[];
  loading: boolean;
}

export default function UnitsTab({ contracts, loading }: UnitsTabProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>لا توجد عقود حتى الآن</p>
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
       <ContractReminderCard daysRemaining={15} contractId={contract._id}/>
      )}

      {/* Payment Due Section */}
      {contract.contractType === 'rent' && (
        <PaymentDueSection contractId={contract._id} />
      )}

      {/* Commitment Reward Section */}
      <RewardSection paymentsOnTime={paymentsOnTime} totalPayments={totalPayments} />

      {/* Unit Details Section */}
      <UnitDetails contract={contract} />
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


function PaymentDueSection({ contractId }: { contractId: string }) {
  const router = useRouter();
  
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-3">
        الدفع خلال 15 يوم
      </h3>
      <button
        onClick={() => router.push(`/contracts/${contractId}/pay`)}
        className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        ادفع الآن
      </button>
    </div>
  );
}

function RewardSection({ paymentsOnTime, totalPayments }: { paymentsOnTime: number; totalPayments: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Gift className="w-5 h-5 text-gray-900 mt-0.5" />
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">مكافأة الالتزام</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            استفيد بالدفع في موعده بن شهر تحصل على شهر مجاني عند التجديد
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div>
        <p className="text-sm text-gray-700 mb-2">
          سددت {paymentsOnTime} من {totalPayments} دفعات في موعدها
        </p>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
          {[...Array(totalPayments)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i < paymentsOnTime
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UnitDetails({ contract }: { contract: Contract }) {
  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-3">تفاصيل الوحدة</h3>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        {/* Property Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-base font-medium">
            {contract.propertyId.titleAr || contract.propertyId.title || 'وحدة رقم 2048'}
          </p>
        </div>

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