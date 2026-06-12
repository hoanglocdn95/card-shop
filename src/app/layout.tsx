import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/providers/cart-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card Shop",
  description: "Báo giá card và gửi đơn vào Google Sheet",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <QueryProvider>
          <I18nProvider>
            <ToastProvider>
              <CartProvider>{children}</CartProvider>
            </ToastProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
