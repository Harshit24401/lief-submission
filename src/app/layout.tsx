import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdProvider from "../providers/AntdProvider"
export const metadata: Metadata = { title: "CareShift" };
import 'antd/dist/reset.css'; // Ant Design 5+ reset styles
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      style={{ background: "#E1E9C9" }}  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<AntdProvider>{children}</AntdProvider>
       </body>
    </html>
  );
}
