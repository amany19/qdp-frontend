'use client';

import Image from 'next/image';
import { getUploadImageUrl } from '@/lib/config';

/**
 * Appliance image with fallback: when there is no image URL, shows a styled
 * placeholder instead of requesting the missing /images/placeholder-appliance.jpg
 * (which caused 400 from Next.js Image optimizer).
 */
export function ApplianceImage({
  imageUrl,
  alt,
  fill = false,
  className = '',
  sizes,
  priority,
}: {
  imageUrl?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = getUploadImageUrl(imageUrl);

  if (!src) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      </div>
    );
  }

  // Use unoptimized so upload URLs are loaded directly from the API server,
  // avoiding 400 from Next.js image optimizer for some URL shapes.
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={384}
      height={256}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
    />
  );
}
