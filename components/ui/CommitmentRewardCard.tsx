'use client';

import React from 'react';
import { Gift } from 'lucide-react';

export interface CommitmentRewardCardProps {
  /** Number of installments paid on time */
  paymentsOnTime: number;
  /** Total number of installments */
  totalPayments: number;
  /** Optional wrapper className (e.g. for layout) */
  className?: string;
}

export default function CommitmentRewardCard({
  paymentsOnTime,
  totalPayments,
  className = '',
}: CommitmentRewardCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 ${className}`}
      dir="rtl"
    >
      <div className="flex items-start gap-2">
        <Gift className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">مكافأة الالتزام</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            سدد الإيجار في موعده كل شهر لتحصل على شهر مجاني عند التجديد.
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-700 mb-2">
          سددت {paymentsOnTime} من {totalPayments} دفعات في موعدها
        </p>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
          {Array.from({ length: totalPayments }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full min-w-[4px] ${
                i < paymentsOnTime ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
