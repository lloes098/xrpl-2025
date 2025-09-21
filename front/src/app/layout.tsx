import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "Ripplize - Web3의 크라우드펀딩 플랫폼",
  description: "XRPL 기반의 탈중앙화 크라우드펀딩 플랫폼. 투명하고 안전한 Web3 프로젝트 펀딩을 경험하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(26, 26, 46, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px 20px',
              maxWidth: '400px',
              zIndex: 9000,
            },
            success: {
              style: {
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              style: {
                border: '1px solid rgba(6, 255, 165, 0.4)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(6, 255, 165, 0.2)',
              },
              iconTheme: {
                primary: '#06ffa5',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
