"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { complaintService } from "@/services/complaintService";
import { useParams, useRouter } from "next/navigation";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react";

export default function AdminComplaintDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintService.getComplaintById(id as string),
  });

  const mutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      complaintService.updateComplaintStatus(id as string, status),
    onSuccess: () => router.push("/admin/complaints"),
  });

  if (isLoading || !complaint) return <p>Loading complaint details...</p>;

  return (
    <div className="min-h-screen p-4 font-[Tajawal] bg-[#FDFDFD]">
      <h1 className="text-xl font-semibold mb-4">تفاصيل الشكوى</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p><strong>اسم الساكن:</strong> {complaint.residentName}</p>
        <p><strong>الهاتف:</strong> {complaint.residentPhone}</p>
        <p><strong>العنوان:</strong> {complaint.residentAddress}</p>
        <p><strong>الوصف:</strong> {complaint.description}</p>
        <p><strong>الحالة:</strong> {complaint.status}</p>

        {complaint.attachments?.length > 0 && (
          <div className="mt-4">
            <strong>المرفقات:</strong>
            <ul className="list-disc ml-6">
              {complaint.attachments.map((file: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, idx: Key | null | undefined) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => mutation.mutate({ status: "resolved" })}
          >
            تم الحل
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => mutation.mutate({ status: "rejected" })}
          >
            مرفوض
          </button>
        </div>
      </div>
    </div>
  );
}