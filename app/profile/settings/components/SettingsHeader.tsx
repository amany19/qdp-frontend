import Image from "next/image";
import { MapIcon, PencilLine } from "lucide-react";

interface SettingsHeaderProps {
  name: string;
  location: string;
  profilePicture: string;
  onEdit?: () => void;
}

export default function SettingsHeader({
  name,
  location,
  profilePicture,
  onEdit,
}: SettingsHeaderProps) {
  return (
    <div
      className="
        w-[360px]
        h-[84px]
        bg-white
        rounded-[10px]
        border border-gray-200
        p-[10px]
        flex
        items-center
        justify-between
        mx-auto
      "
    >
      {/* Right Section (Avatar + Text) */}
      <div className="flex items-center gap-[10px]">
        {/* Avatar */}
        <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image
            src={profilePicture}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Info */}
        <div className="flex flex-col justify-center">
          <h2 className="text-[16px] font-bold text-gray-900 leading-tight">
            {name}
          </h2>

          <div className="flex items-center gap-1 text-gray-500 text-[14px]">
            <MapIcon size={14} />
            <span>{location}</span>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="text-gray-500 hover:text-gray-700"
      >
        <PencilLine size={18} />
      </button>
    </div>
  );
}