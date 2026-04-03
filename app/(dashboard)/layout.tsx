import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AdvisorChat } from '@/components/ai/AdvisorChat'
import { AudioControlBar } from '@/components/audio/AudioControlBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--bg-base]">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
      <AdvisorChat />
      <AudioControlBar />
    </div>
  )
}
