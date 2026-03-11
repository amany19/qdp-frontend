import { Facebook, Twitter } from 'lucide-react'

export default function SocialSection() {
  return (
    <div className="p-4   
    flex flex-row 
    justify-between
    w-[350px]
        bg-[#F2F2F2]
        rounded-[10px]   
        m-auto
        p-[10px]">
      <p className="font-medium mb-3">شبكاتنا</p>

      <div className="flex  gap-3">
        <button className="p-2 w-8 h-8 bg-black text-white rounded-full">
          <Twitter className="w-4 h-4" strokeWidth={3} />
        </button>

        <button className="p-2 w-8 h-8 bg-black text-white rounded-full">
          <Facebook className="w-4 h-4" strokeWidth={3}/>
        </button>
      </div>
    </div>
  )
}