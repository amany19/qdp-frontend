import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PageWrapper from "@/components/PageWrapper";

const tajawal = Tajawal({
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "QDP - Qatar Digital Properties",
  description: "منصة قطر الرقمية للعقارات",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QDP',
  },
};

// Viewport configuration (Next.js 15+ requirement)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${tajawal.variable} antialiased`}
      >
        
        <Providers><PageWrapper>{children}</PageWrapper></Providers>
      </body>
    </html>
  );
}
