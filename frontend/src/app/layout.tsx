import type { Metadata, Viewport } from 'next'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import AppWrapper from '@/components/AppWrapper'

export const metadata: Metadata = {
  title: 'FINE MODE — AR+AI 3D Learning',
  description: 'แพลตฟอร์มการเรียนรู้แบบบูรณาการ 3 มิติ ผ่าน AR + AI สำหรับพัฒนาสมรรถนะการบริการอาหารและเครื่องดื่ม',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png', rel: 'icon' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png', rel: 'icon' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FINE MODE',
    startupImage: '/logo.png',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'FINE MODEL 3D AR+AI',
    description: 'เรียนรู้การบริการอาหารและเครื่องดื่มผ่าน AR + AI ระดับโรงแรม 6 ดาว',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'FINE MODEL 3D AR+AI Logo' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E4D3A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <RoleProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </RoleProvider>
      </body>
    </html>
  )
}

