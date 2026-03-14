'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { residentOffersService } from '@/services/residentOffersService';
import { getOfferPartnerName, type ResidentOffer } from '@/types/residentOffer';
import RoleGuard from '@/components/auth/RoleGuard';
import PageWrapper from '@/components/PageWrapper';
import HeaderCard from '@/components/ui/HeaderCard';
import { ArrowRight, Tag, ExternalLink } from 'lucide-react';

function formatValidUntil(validUntil?: string) {
  if (!validUntil) return null;
  const d = new Date(validUntil);
  return d.toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function OffersPage() {
  const router = useRouter();
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['resident-offers'],
    queryFn: () => residentOffersService.getAll(),
  });

  return (
    <RoleGuard allowedRoles={['resident']}>
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
          <HeaderCard
            title="عروض المقيمين"
            leftButton={
              <button
                type="button"
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="رجوع"
              >
                <ArrowRight className="w-5 h-5 text-gray-900" />
              </button>
            }
          />

          <div className="px-4 py-6">
            <p className="text-sm text-gray-500 mb-4">
              خصومات وعروض حصرية من شركائنا لمقيمي QDP
            </p>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">لا توجد عروض حالياً</p>
                <p className="text-sm text-gray-400 mt-1">تحقق لاحقاً من العروض الجديدة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(offers as ResidentOffer[]).map((offer) => (
                  <article
                    key={offer._id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                          <Tag className="h-6 w-6 text-amber-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="font-bold text-gray-900">
                            {offer.title}
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {getOfferPartnerName(offer)}
                          </p>
                          <p className="text-sm text-amber-700 font-medium mt-1">
                            {offer.discountText}
                          </p>
                          {offer.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {offer.description}
                            </p>
                          )}
                          {offer.validUntil && (
                            <p className="text-xs text-gray-400 mt-2">
                              صالح حتى: {formatValidUntil(offer.validUntil)}
                            </p>
                          )}
                          {offer.actionUrl && (
                            <a
                              href={offer.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 mt-2"
                            >
                              استخدم العرض
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </RoleGuard>
  );
}
