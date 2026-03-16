'use client';

import Image from 'next/image';
import { useState } from 'react';

const HERO_IMAGE_PATH = '/images/hero-banner.png';

export default function HomeHero() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="px-4 mb-6">
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {!imageError ? (
          <Image
            src={HERO_IMAGE_PATH}
            alt="Qatar Dynamic Properties"
            fill
            className="object-cover"
            priority
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">حيث تلتقي الفخامة بالبساطة</h2>
          <p className="text-sm opacity-90">الفخامة والرفاهية والهندسة المعمارية المثالية</p>
        </div>
      </div>
    </div>
  );
}