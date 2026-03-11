import { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface SettingsItemProps {
  icon: ReactNode
  title: string
  description?: string
  href?: string
}

export default function SettingsItem({
  icon,
  title,
  description,
  href = '#',
}: SettingsItemProps) {
  return (
    <Link
      href={href}
      className="flex w-[340px] m-auto items-center justify-between py-4 border-b-2 hover:bg-[#F2F2F2] border-[#F2F2F2] transition"
    >
      <div className="flex items-center gap-3 text-right "

      >
        <div
          className="p-2 bg-[#F2F2F2] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"

        >{icon}</div>

        <div>
          <p className="font-medium text-gray-900">{title}</p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>

      <ArrowLeft
        className="w-4 h-4 text-black"
        strokeWidth={3}
      />
    </Link>
  )
}