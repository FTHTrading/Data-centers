'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Database, Radio, Users, CheckSquare,
  FileText, Search, BookOpen, Settings, List, ChevronRight, GraduationCap,
  Server, Download, Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',    href: '/',               icon: LayoutDashboard },
  { label: 'Pipeline',     href: '/pipeline',        icon: List },
  { label: 'Sourcing',     href: '/sourcing',        icon: Search },
  null,
  { label: 'Data Centers', href: '/data-centers',    icon: Server },
  { label: 'Documents',    href: '/documents',       icon: FileText },
  { label: 'Resources',    href: '/resources',       icon: Package },
  null,
  { label: 'Agents',       href: '/agents',          icon: Radio },
  { label: 'Approvals',    href: '/approvals',       icon: CheckSquare },
  { label: 'Reports',      href: '/reports',         icon: Database },
  { label: 'DC Guide',     href: '/learn',           icon: GraduationCap },
  null,
  { label: 'Knowledge',    href: '/knowledge',       icon: BookOpen },
  { label: 'Audit Log',    href: '/audit',           icon: List },
  { label: 'Settings',     href: '/settings',        icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-[--bg-card] border-r border-[--bg-border] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[--bg-border]">
        <span className="text-[--accent-blue] font-bold tracking-wide text-sm">UNYKORN</span>
        <span className="text-[--text-dimmed] text-xs block">DC-OS v1.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item, i) => {
          if (!item) {
            return <div key={i} className="my-2 border-t border-[--bg-border]" />
          }
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn('nav-item', active && 'active')}>
              <Icon size={15} />
              <span>{item.label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[--bg-border]">
        <span className="text-[10px] text-[--text-dimmed] uppercase tracking-widest">
          Institutional Use Only
        </span>
      </div>
    </aside>
  )
}
