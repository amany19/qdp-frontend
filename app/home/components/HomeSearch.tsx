'use client';

import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function HomeSearch() {
  const router = useRouter();

  return (
    <div className="px-4 py-4 bg-white">
      <div
        className="flex items-center justify-between w-full px-2 py-1 rounded-lg text-right cursor-pointer border border-[#E8E8E8] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]"
        style={{ backgroundColor: 'var(--foundation-light-active, #FAFAFA)' }}
      >
        <div>
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-3 flex-1"
            aria-label="البحث"
          >
            <Search color="#666666" />
            <span className="text-gray-400 text-md flex-1">البحث</span>
          </button>
        </div>
        <button
          onClick={() => router.push('/search/filters')}
          className="p-1"
          aria-label="تصفية النتائج"
        >
          <SlidersHorizontal color="#666666" />
        </button>
      </div>
    </div>
  );
}