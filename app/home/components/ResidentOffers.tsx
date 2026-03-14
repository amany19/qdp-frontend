'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { residentOffersService } from '@/services/residentOffersService';
import { getOfferPartnerName } from '@/types/residentOffer';
import { Tag } from 'lucide-react';

export default function ResidentOffers() {
  const router = useRouter();
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['resident-offers'],
    queryFn: () => residentOffersService.getAll(),
  });

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">عروض المقيمين</h3>
        <button
          type="button"
          onClick={() => router.push('/offers')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          عرض الكل
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <button
          type="button"
          onClick={() => router.push('/offers')}
          className="w-full text-right rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Tag className="h-5 w-5 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">لا توجد عروض حالياً</p>
              <p className="text-xs text-gray-500">عرض الصفحة</p>
            </div>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          {offers.slice(0, 2).map((offer) => (
            <button
              key={offer._id}
              type="button"
              onClick={() => router.push('/offers')}
              className="w-full text-right rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Tag className="h-5 w-5 text-amber-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {offer.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {getOfferPartnerName(offer)} · {offer.discountText}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
