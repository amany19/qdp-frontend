'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Splash2() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/splash/3');
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* QDP Logo */}
      <div className="animate-fade-in">
        <Image
          src="/logo.png"
          alt="QDP Logo"
          width={200}
          height={80}
          priority
        />
      </div>
    </div>
  );
}
