// lib/utils.ts — Shared utilities

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import type { SiteRecommendation, RiskSeverity, AgentRunStatus, TaskStatus, TaskPriority } from '@/types'

// ── Tailwind class merging ─────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date formatting ────────────────────────────────────────────────────────
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

// ── Number formatting ──────────────────────────────────────────────────────
export function formatMW(mw: number | null | undefined): string {
  if (mw == null) return '—'
  return mw >= 1000 ? `${(mw / 1000).toFixed(1)} GW` : `${mw} MW`
}

export function formatMillions(m: number | null | undefined, decimals = 1): string {
  if (m == null) return '—'
  return `$${m.toFixed(decimals)}M`
}

export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—'
  return `${n.toFixed(decimals)}%`
}

export function formatPUE(pue: number | null | undefined): string {
  if (pue == null) return '—'
  return pue.toFixed(2)
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return '—'
  return score.toFixed(1)
}

export function formatKwh(kwh: number | null | undefined): string {
  if (kwh == null) return '—'
  return `$${kwh.toFixed(3)}/kWh`
}

// ── Status labels & colors ─────────────────────────────────────────────────
export const SITE_STATUS_LABELS: Record<string, string> = {
  INTAKE:        'Intake',
  SCREENING:     'Screening',
  IN_REVIEW:     'In Review',
  SHORTLISTED:   'Shortlisted',
  IN_DILIGENCE:  'In Diligence',
  APPROVED:      'Approved',
  REJECTED:      'Rejected',
  WATCHLIST:     'Watchlist',
  ARCHIVED:      'Archived',
}

export const SITE_STATUS_COLORS: Record<string, string> = {
  INTAKE:        'bg-graphite-700 text-graphite-300',
  SCREENING:     'bg-blue-900/50 text-blue-300',
  IN_REVIEW:     'bg-yellow-900/50 text-yellow-300',
  SHORTLISTED:   'bg-purple-900/50 text-purple-300',
  IN_DILIGENCE:  'bg-orange-900/50 text-orange-300',
  APPROVED:      'bg-emerald-900/50 text-emerald-300',
  REJECTED:      'bg-red-900/50 text-red-300',
  WATCHLIST:     'bg-amber-900/50 text-amber-300',
  ARCHIVED:      'bg-graphite-800 text-graphite-500',
}

export const RECOMMENDATION_COLORS: Record<SiteRecommendation, string> = {
  FLAGSHIP_FIT:  'text-emerald-400',
  STRATEGIC_FIT: 'text-dc-blue-400',
  STANDARD_FIT:  'text-yellow-400',
  WATCHLIST:     'text-orange-400',
  REJECT:        'text-red-400',
}

export const RECOMMENDATION_BG: Record<SiteRecommendation, string> = {
  FLAGSHIP_FIT:  'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  STRATEGIC_FIT: 'bg-dc-blue-900/40 text-dc-blue-300 border-dc-blue-700/50',
  STANDARD_FIT:  'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  WATCHLIST:     'bg-orange-900/40 text-orange-300 border-orange-700/50',
  REJECT:        'bg-red-900/40 text-red-300 border-red-700/50',
}

export const RISK_SEVERITY_COLORS: Record<RiskSeverity, string> = {
  CRITICAL: 'bg-red-900/60 text-red-300 border-red-700/50',
  HIGH:     'bg-orange-900/50 text-orange-300 border-orange-700/50',
  MEDIUM:   'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  LOW:      'bg-blue-900/30 text-blue-300 border-blue-700/30',
  INFO:     'bg-graphite-800 text-graphite-400 border-graphite-700',
}

export const AGENT_STATUS_COLORS: Record<AgentRunStatus, string> = {
  QUEUED:          'bg-graphite-800 text-graphite-400',
  RUNNING:         'bg-dc-blue-900/50 text-dc-blue-300 animate-pulse',
  COMPLETED:       'bg-emerald-900/40 text-emerald-300',
  FAILED:          'bg-red-900/50 text-red-300',
  CANCELLED:       'bg-graphite-700 text-graphite-400',
  AWAITING_REVIEW: 'bg-yellow-900/50 text-yellow-300',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  OPEN:        'bg-graphite-700 text-graphite-300',
  IN_PROGRESS: 'bg-dc-blue-900/50 text-dc-blue-300',
  BLOCKED:     'bg-red-900/50 text-red-300',
  COMPLETED:   'bg-emerald-900/40 text-emerald-300',
  CANCELLED:   'bg-graphite-800 text-graphite-500',
  ESCALATED:   'bg-orange-900/50 text-orange-300',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  CRITICAL: 'text-red-400',
  HIGH:     'text-orange-400',
  MEDIUM:   'text-yellow-400',
  LOW:      'text-graphite-400',
}

// ── Slug generator ─────────────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ── Site completeness calculation (simple) ─────────────────────────────────
export function computeCompleteness(
  totalFields: number,
  filledFields: number
): number {
  if (totalFields === 0) return 0
  return Math.round((filledFields / totalFields) * 100)
}

// ── Score color ────────────────────────────────────────────────────────────
export function scoreToColor(score: number | null | undefined): string {
  if (score == null) return 'text-graphite-500'
  if (score >= 80) return 'text-emerald-400'
  if (score >= 65) return 'text-dc-blue-400'
  if (score >= 50) return 'text-yellow-400'
  if (score >= 30) return 'text-orange-400'
  return 'text-red-400'
}

// ── Confidence color ───────────────────────────────────────────────────────
export function confidenceToColor(conf: number | null | undefined): string {
  if (conf == null) return 'text-graphite-500'
  if (conf >= 0.85) return 'text-emerald-400'
  if (conf >= 0.70) return 'text-yellow-400'
  return 'text-orange-400'
}
