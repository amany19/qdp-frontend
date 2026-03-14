"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/services/complaintService";
import { Complaint } from "@/types/complaints";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import HeaderCard from "@/components/ui/HeaderCard";

export default function ComplaintsPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: complaintService.getMyComplaints,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري التحميل...
      </div>
    );
  }

  const complaints: Complaint[] = data?.data || data || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-[Tajawal]">

      {/* Header */}

    <HeaderCard
      title="الشكاوي"
      leftButton={
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-900" />
        </button>
      }

    />

      <div className="p-5 space-y-4">

        <button
          onClick={() => router.push("/profile/complaints/new")}
          className="w-full bg-[#000] text-white py-3 rounded-xl"
        >
          تقديم شكوى
        </button>

        {complaints.map((c) => (
          <div
            key={c.id}
            onClick={() => router.push(`/complaints/${c.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer"
          >
            <h3 className="font-bold">{c.title}</h3>

            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {c.description}
            </p>

            <div className="mt-2 text-sm">
              {c.status === "pending" && (
                <span className="text-[#FB8C00]">قيد المراجعة</span>
              )}
              {c.status === "in-progress" && (
                <span className="text-blue-500">جاري المعالجة</span>
              )}
              {c.status === "resolved" && (
                <span className="text-[#34A853]">تم الحل</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}