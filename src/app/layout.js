import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from '@/context/SettingsContext';
import HotjarScript from '@/components/HotjarScript'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Badminton Match Manager',
  description: 'Manage badminton matches and queues',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <HotjarScript />
          {/* <link rel="manifest" href="/manifest.json" /> */}
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Badminton Match Manager" />
      </head>
      <body className={inter.className}>
        <TooltipProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
          <Toaster />
        </TooltipProvider>
        <GoogleAnalytics gaId="G-NRJLDJV7D9" />
      </body>
    </html>
  )
}
