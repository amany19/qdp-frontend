import Image from 'next/image';

export default function HomeHero() {
  return (
      <div className="px-4 mb-6">
        <div className="relative h-48 rounded-xl overflow-hidden">
          <Image
            src="/images/hero-banner.png"
            alt="Qatar Dynamic Properties"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">حيث تلتقي الفخامة بالبساطة</h2>
            <p className="text-sm opacity-90">الفخامة والرفاهية والهندسة المعمارية المثالية</p>
          </div>
        </div>
      </div>
  );
}