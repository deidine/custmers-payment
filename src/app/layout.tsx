import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import ParentProvider from "@/contexts/ParentProvider";

export const metadata: Metadata = {
  title: "Mua Thuốc Online | V2H Pharmacy Store - Cửa Hàng Thuốc 24/7",
  description:
    "Mua thuốc online tại V2H Pharmacy Store, cửa hàng thuốc hoạt động 24/7. Đảm bảo chất lượng, giao hàng nhanh chóng, tiện lợi và bảo mật.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://kit.fontawesome.com/980564d5b0.js"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        ></Script>
      </head>
      <body>
        <ParentProvider>
          <Header />
          <main className="relative flex-grow">{children}</main>
          <Footer />
        </ParentProvider>
      </body>
    </html>
  );
}
