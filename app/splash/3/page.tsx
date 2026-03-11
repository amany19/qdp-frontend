'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Splash3() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/splash/4');
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8">
      {/* QDP Logo with Company Name */}
      <div className="animate-fade-in">
        <Image
          src="/logo-with-text.png"
          alt="QDP Logo"
          width={280}
          height={150}
          priority
        />
      </div>
    </div>
  );
}
