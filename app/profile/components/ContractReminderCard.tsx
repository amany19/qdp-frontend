'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';

interface ContractReminderCardProps {
    daysRemaining: number;
    contractId: string;
    paymentDueDays?: number;
    /** When 'resident', "ادفع الآن" goes to وحدتي instead of حجوزاتي */
    userType?: string;
    /** Optional: show remaining unpaid amount (e.g. on my-unit page) */
    remainingBalance?: number;
    /** Optional: override "ادفع الآن" link (e.g. to booking detail page) */
    payNowHref?: string;
    /** Optional: disable "ادفع الآن" when no booking (my-unit) */
    payNowDisabled?: boolean;
    /** Optional: root className (e.g. w-full for my-unit page) */
    className?: string;
}

export default function ContractReminderCard({
    daysRemaining,
    contractId,
    paymentDueDays = 15,
    userType,
    remainingBalance,
    payNowHref: payNowHrefOverride,
    payNowDisabled = false,
    className = '',
}: ContractReminderCardProps) {
    const router = useRouter();
    const defaultPayHref = userType === 'resident' ? '/my-unit' : '/my-bookings';
    const payNowHref = payNowHrefOverride ?? defaultPayHref;

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
        <div className={`w-[350px] max-w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-start gap-2 ${className}`.trim()}>
            {/* Warning Message Section */}
            <div className="w-full flex flex-col items-start gap-2.5 py-2">
                <div className="w-full flex items-center justify-end gap-2">
                    {/* Warning Icon */}
                    <CircleAlert color="#C83636" />
                    {/* Warning Text */}
                    <p className="text-xs text-gray-700 flex-1">
                        متبقي شهر على انتهاء عقد ايجارك{' '}
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
                    <div className="w-full flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#303030]">
                            الدفع خلال {paymentDueDays} يوم
                        </span>
                        {remainingBalance != null && remainingBalance > 0 && (
                            <div className="flex justify-between items-center text-sm w-full">
                                <span className="text-gray-600">المبلغ المتبقي</span>
                                <span className="font-semibold text-amber-700">
                                    {remainingBalance.toLocaleString('ar-QA')} ر.ق
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => !payNowDisabled && router.push(payNowHref)}
                            disabled={payNowDisabled}
                            className="w-[164px] bg-gray-900 text-white self-end text-sm font-bold px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-sm border border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ادفع الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}