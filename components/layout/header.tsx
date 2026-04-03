'use client'

import Link from 'next/link'
import { Bell, Plus } from 'lucide-react'

interface HeaderProps {
  title?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function Header({ title, breadcrumbs }: HeaderProps) {

  return (
    <header className="sticky top-0 z-30 h-12 bg-[--bg-card]/80 backdrop-blur border-b border-[--bg-border] flex items-center px-4 gap-3">
      {/* Breadcrumb / title */}
      <div className="flex-1 flex items-center gap-2 text-sm min-w-0">
        {breadcrumbs ? (
          <nav className="flex items-center gap-1.5 text-[--text-muted] truncate">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[--text-dimmed]">/</span>}
                {b.href ? (
                  <Link href={b.href} className="hover:text-[--text-primary] transition-colors truncate">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[--text-primary] font-medium truncate">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <span className="text-sm font-medium text-[--text-primary]">{title ?? 'DC-OS'}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link href="/sites/new" className="btn-primary py-1 px-2 text-xs gap-1">
          <Plus size={12} />
          New Site
        </Link>

        <button className="btn-ghost p-1.5" aria-label="Notifications">
          <Bell size={15} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[--bg-border]">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-[--text-primary] leading-tight">Kevan</div>
            <div className="text-[10px] text-[--text-muted] leading-tight capitalize">admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
