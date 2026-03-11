'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';

interface ContractReminderCardProps {
    daysRemaining: number;
    contractId: string;
    paymentDueDays?: number;
}

export default function ContractReminderCard({
    daysRemaining,
    contractId,
    paymentDueDays = 15
}: ContractReminderCardProps) {
    const router = useRouter();

    // Custom Info Icon SVG
    const InfoIcon = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0)">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="#C83636" />
            </g>
            <defs>
                <clipPath id="clip0">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );

    return (
        <div className="w-[350px] bg-white rounded-2xl shadow-[0px_1px_5px_rgba(0,0,0,0.05)] p-5 flex flex-col items-start gap-2">
            {/* Warning Message Section */}
            <div className="w-full flex flex-col items-start gap-2.5 py-2">
                <div className="w-full flex items-center justify-end gap-2">
                    {/* Warning Icon */}
                    <CircleAlert color="#C83636" />
                    {/* Warning Text */}
                    <p className="text-xs text-gray-700 flex-1">
                        منتهي، تبقى شهر على إنتهاء عقد الايجار{' '}
                        <span
                            className="text-[#C83636] font-bold underline cursor-pointer"
                            onClick={() => router.push('/contract/renew')}
                        >
                            جدّد العقد الآن
                        </span>
                    </p>
                </div>
            </div>

            {/* Payment Section */}
            <div className="w-full flex flex-col items-start gap-4">
                <div className="w-full flex flex-col items-start gap-2">
                    <div className="w-full flex flex-col">
                        <span className="text-sm font-bold  text-[#303030]">
                            الدفع خلال {paymentDueDays} يوم
                        </span>

                        <button
                            onClick={() => router.push(`/contracts/${contractId}/pay`)}
                            className="w-[164px] bg-gray-900 text-white self-end text-sm font-bold px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-sm border border-gray-900"
                        >
                            ادفع الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}