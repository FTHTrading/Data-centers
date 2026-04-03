import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Are You Ready? | UnyKorn DC-OS',
  description: 'Have an honest conversation with our AI advisor. Find out if you have what it takes to operate in institutional data center investment — or what you need to build first.',
}

export default function QualifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--bg-base] flex flex-col">
      {children}
    </div>
  )
}
