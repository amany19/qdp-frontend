"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/services/complaintService";
import { useRouter } from "next/navigation";

export default function AdminComplaintsPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["adminComplaints"],
    queryFn: complaintService.getAllComplaints,
  });

  if (isLoading) return <p>Loading complaints...</p>;
console.log(data)
  return (
    <div className="min-h-screen p-4 font-[Tajawal] bg-[#FDFDFD]">
      <h1 className="text-xl font-semibold mb-4">جميع الشكاوى</h1>
      <div className="grid gap-4">
        {data?.map((complaint: any) => (
          <div
            key={complaint.id}
            className="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
          >
            <p><strong>اسم الساكن:</strong> {complaint.residentName}</p>
            <p><strong>الهاتف:</strong> {complaint.residentPhone}</p>
            <p><strong>العنوان:</strong> {complaint.residentAddress}</p>
            <p><strong>الحالة:</strong> {complaint.status}</p>
            <p><strong>تاريخ التقديم:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}