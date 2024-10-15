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
