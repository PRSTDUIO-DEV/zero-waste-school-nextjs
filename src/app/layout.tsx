import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Zero Waste School System",
  description: "ระบบติดตามและจัดการขยะในโรงเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
