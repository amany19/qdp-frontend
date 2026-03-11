import Image from 'next/image'
import { MapPin } from 'lucide-react'

export default function ProfileHero({ user }: any) {
  return (
    <div className="bg-white px-5 py-6 border-b border-gray-100">
      <div className="flex items-center gap-4">

        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          {user?.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt={user.fullName}
              width={64}
              height={64}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-xl text-gray-500">
              {user?.fullName?.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 text-right">
          <h2 className="text-lg font-bold text-gray-900">
            {user?.fullName}
          </h2>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>الدوحة، قطر</span>
          </div>
        </div>

      </div>
    </div>
  )
}