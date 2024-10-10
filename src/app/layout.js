import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from '@/context/SettingsContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Badminton Match Manager',
  description: 'Manage badminton matches and queues',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}