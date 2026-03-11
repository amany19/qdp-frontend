'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search/results?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold flex-1 text-center">البحث</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="البحث"
            className="flex-1 outline-none text-base"
            autoFocus
          />
          <button
            onClick={() => router.push('/search/filters')}
            className="p-1"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 mb-6 rounded-full bg-gray-50 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          ابحث عن وحدتك المثالية
        </h3>
        <p className="text-gray-500 text-sm max-w-xs">
          ابدأ بالبحث عن العقارات والوحدات السكنية في قطر
        </p>
      </div>
    </div>
  );
}
