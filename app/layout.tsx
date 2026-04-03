import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { AudioProvider } from '@/components/audio/DataCenterAudio'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'UnyKorn DC-OS', template: '%s | UnyKorn DC-OS' },
  description: 'AI-agentic data center operating system - sourcing, qualification, and capital formation.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${mono.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <SessionProvider session={null}>
          <AudioProvider>
            {children}
          </AudioProvider>
        </SessionProvider>
      </body>
    </html>
  )
}