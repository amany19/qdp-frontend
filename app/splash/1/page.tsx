'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash1() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/splash/2');
    }, 1000); // 1 second

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Pure black screen - initial loading */}
    </div>
  );
}
