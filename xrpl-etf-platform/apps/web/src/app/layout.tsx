import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/providers/query-provider'
import Navigation from '@/components/layout/navigation'
import ToastContainer from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'XRPL ETF Platform',
  description: 'XRPL 기반 ETF 거래 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-black text-white">
            <Navigation />
            
            {/* Main Content */}
            <main className="lg:ml-64">
              <div className="pt-16 lg:pt-0">
                {children}
              </div>
            </main>
            
            <ToastContainer />
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}