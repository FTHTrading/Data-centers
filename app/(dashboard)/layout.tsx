import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-[--bg-base]">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
