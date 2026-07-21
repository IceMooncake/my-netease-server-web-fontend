import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { TRPCProvider } from '@/lib/trpc/Provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "网易IceTown租赁服",
  description: "网易IceTown租赁服圈地管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
