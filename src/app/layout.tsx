import type { Metadata } from "next";
import { Noto_Serif_SC, Noto_Sans_SC, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const mashan = Ma_Shan_Zheng({
  variable: "--font-mashan",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "玄鉴 AI · 东方术数研究空间",
  description:
    "玄鉴 AI — 传统术数知识库 + 算法计算系统 + AI智能推演助手。八字命理、六爻梅花、奇门遁甲、塔罗占卜、姓名数理、典籍库、天机AI、历史档案。",
  keywords: [
    "玄鉴AI", "八字命理", "六爻", "梅花易数", "奇门遁甲",
    "塔罗", "姓名学", "术数", "东方智慧", "易学",
  ],
  authors: [{ name: "玄鉴 AI" }],
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/logo.svg" },
    { rel: "apple-touch-icon", url: "/logo.svg" },
  ],
  openGraph: {
    title: "玄鉴 AI · 东方术数研究空间",
    description: "现代化东方术数研究空间 — 知识库 · 算法 · AI推演",
    siteName: "玄鉴 AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body
        className={`${notoSerif.variable} ${notoSans.variable} ${mashan.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
