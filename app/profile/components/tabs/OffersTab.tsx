'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { residentOffersService } from '@/services/residentOffersService';
import { getOfferPartnerName } from '@/types/residentOffer';
import { Tag } from 'lucide-react';

export default function OffersTab() {
  const router = useRouter();
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['resident-offers'],
    queryFn: () => residentOffersService.getAll(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>لا توجد عروض حالياً</p>
        <p className="text-sm mt-1">تحقق لاحقاً من العروض الحصرية للمقيمين</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        خصومات وعروض من شركائنا حصرياً لمقيمي QDP
      </p>
      {offers.map((offer) => (
        <button
          key={offer._id}
          type="button"
          onClick={() => router.push('/offers')}
          className="w-full text-right bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Tag className="h-5 w-5 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{offer.title}</p>
              <p className="text-xs text-gray-500">
                {getOfferPartnerName(offer)} · {offer.discountText}
              </p>
            </div>
          </div>
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push('/offers')}
        className="w-full py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
      >
        عرض كل العروض
      </button>
    </div>
  );
}
