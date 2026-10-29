import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Ôn Tập Từ Vựng JLPT N2 - Luyện Cách Đọc & Ghi Chú",
  description: "Trang web ôn tập từ vựng JLPT N2 với tính năng điền cách đọc, xem ghi chú đặc điểm và làm bài thi.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JLPT N2 Vocab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#fbfbfc] text-[#2d3138] antialiased selection:bg-zinc-200">
        {children}
      </body>
    </html>
  );
}
