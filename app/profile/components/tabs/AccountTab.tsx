import MapPreview from '@/components/MapPreview'
import { useUserLocation } from '@/hooks/useUserLocation';
import { PencilLine , MapPin } from 'lucide-react'

export default function AccountTab({ user, onLogout }: any) {
  const { lat, lng } = useUserLocation();
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm">

      <Field label="الاسم" value={user?.fullName} />
      <Field label="رقم الهاتف" value={user?.phone} />
      <Field label="البريد الإلكتروني" value={user?.email} />


      {lat && lng ? (

        <MapPreview lat={lat} lng={lng} />
      ) : (
      <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center">

               <MapPin className="w-8 h-8 text-gray-400" />
    </div>


      )}
    </div>
  )
}

function Field({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <div >
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
      <PencilLine className="w-5 h-5 text-black" />

    </div>
  )
}