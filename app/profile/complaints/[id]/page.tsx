"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/services/complaintService";

export default function ComplaintDetails() {

  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintService.getById(id),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;

  const complaint = data?.data || data;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-[Tajawal]">

      <div className="bg-white shadow-sm rounded-b-[30px] p-4 text-center font-semibold text-lg">
        تفاصيل الشكوى
      </div>

      <div className="p-5 space-y-4">

        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-bold">{complaint.title}</h2>
          <p className="text-gray-600 mt-2">{complaint.description}</p>
        </div>

        {complaint.adminResponse && (
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-bold">رد الإدارة</h3>
            <p className="text-gray-600 mt-2">
              {complaint.adminResponse}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}