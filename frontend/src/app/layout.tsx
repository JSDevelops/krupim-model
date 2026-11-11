import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Kanit, Noto_Sans_Thai, Prompt, Sarabun } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import AppWrapper from '@/components/AppWrapper'
import FontPreferenceSync from '@/components/FontPreferenceSync'
import AppToaster from '@/components/AppToaster'
import AppConfirmDialog from '@/components/AppConfirmDialog'

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
  preload: false,
})

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
  preload: false,
})

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
  preload: false,
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: 'variable',
  variable: '--font-noto-sans-thai',
  display: 'swap',
  preload: false,
})


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://finemodel.app'),
  title: 'FINE MODEL (AR 3D+AI Scan) — การเรียนรู้ภาษาอังกฤษเพื่องานบริการ',
  description: 'แพลตฟอร์มการเรียนรู้แบบบูรณาการผ่าน AR 3D+AI Scan สำหรับพัฒนาสมรรถนะการบริการอาหารและเครื่องดื่ม',
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
    title: 'FINE MODEL',
    startupImage: '/logo.png',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'FINE MODEL · AR 3D+AI Scan',
    description: 'แพลตฟอร์มการเรียนรู้ภาษาอังกฤษผ่าน AR 3D และ AI สำหรับพัฒนาสมรรถนะงานบริการอาหารและเครื่องดื่ม',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'FINE MODEL AR 3D+AI Scan Logo' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1E4D3A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="th"
      data-app-font="kanit"
      data-text-size="normal"
      suppressHydrationWarning
      className={`${kanit.variable} ${sarabun.variable} ${prompt.variable} ${notoSansThai.variable}`}
    >
      <head>
        <Script id="appearance-preference" strategy="beforeInteractive">
          {`try{var f=localStorage.getItem('uxFontFamily');var s=localStorage.getItem('uxTextSize');if(['kanit','sarabun','prompt','noto-sans-thai'].includes(f)){document.documentElement.dataset.appFont=f}if(['normal','large','xlarge'].includes(s)){document.documentElement.dataset.textSize=s}}catch(e){}`}
        </Script>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <FontPreferenceSync />
        <AppToaster />
        <AppConfirmDialog />
        <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js" strategy="lazyOnload" />
        <RoleProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </RoleProvider>
      </body>
    </html>
  )
}

