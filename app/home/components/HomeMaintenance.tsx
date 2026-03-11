'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChairIcon, ConditionerIcon, ElectricityIcon, TabIcon } from '@/components/icons';

export default function HomeMaintenance() {
  const router = useRouter();

  const maintenanceCategories = [
    { id: 'furniture', label: 'صيانة الأثاث', icon: ChairIcon },
    { id: 'plumbing', label: 'صيانة السباكة', icon: TabIcon },
    { id: 'electrical', label: 'صيانة الكهرباء', icon: ElectricityIcon },
    { id: 'ac', label: 'صيانة التكييف', icon: ConditionerIcon },




  ];

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">اطلب صيانتك</h3>
        <button
          onClick={() => router.push('/services')}
          className="text-sm text-gray-500"
        >
          المزيد
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {maintenanceCategories.map((category) => {
          const Icon = category.icon;
          return (<button
            key={category.id}
            onClick={() => router.push(`/services?category=${category.id}`)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-[#F3F1EB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors relative">
              <Icon className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-xs text-center text-gray-700">{category.label}</span>
          </button>)
        })}
      </div>
    </div>
  );
}