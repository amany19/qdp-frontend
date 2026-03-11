"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { complaintService } from "@/services/complaintService";

export default function NewComplaintPage() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    await complaintService.create({
      title,
      description,
    });

    router.push("/complaints");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-[Tajawal]">

      <div className="bg-white shadow-sm rounded-b-[30px] p-4 text-center font-semibold text-lg">
        تقديم شكوى
      </div>

      <div className="p-5 space-y-4">

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الشكوى"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف المشكلة"
          className="w-full border rounded-lg p-3 h-32"
        />

        <button
          onClick={submit}
          className="w-full bg-[#34A853] text-white py-3 rounded-xl"
        >
          إرسال الشكوى
        </button>

      </div>
    </div>
  );
}