'use client'

import { useState, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  active: string
  setActive: (id: string) => void
}

const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} })

interface TabsProps {
  defaultTab: string
  className?: string
  children: React.ReactNode
}

export function Tabs({ defaultTab, className, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex border-b border-[var(--bg-border)] overflow-x-auto', className)}>
      {children}
    </div>
  )
}

interface TabProps {
  id: string
  label: string
  count?: number
}

export function Tab({ id, label, count }: TabProps) {
  const { active, setActive } = useContext(TabsContext)
  const isActive = active === id
  return (
    <button
      onClick={() => setActive(id)}
      className={cn(
        'px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px',
        isActive
          ? 'border-[var(--accent-blue)] text-white'
          : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]'
      )}
    >
      {label}
      {count != null && (
        <span className={cn(
          'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium',
          isActive ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-border)] text-[var(--fg-muted)]'
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

interface TabPanelProps {
  id: string
  className?: string
  children: React.ReactNode
}

export function TabPanel({ id, className, children }: TabPanelProps) {
  const { active } = useContext(TabsContext)
  if (active !== id) return null
  return <div className={cn('', className)}>{children}</div>
}
