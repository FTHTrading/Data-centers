import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { authOptions } from '@/lib/auth'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'UnyKorn DC-OS', template: '%s | UnyKorn DC-OS' },
  description: 'AI-agentic data center operating system — sourcing, qualification, and capital formation.',
  robots: 'noindex, nofollow',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" className={`dark ${mono.variable}`} suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
