// services/exports/pdf.ts
// PDF export service — Executive Memo, IC Memo, Technical Report

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SiteSummary } from '@/types'

const BRAND_BLUE = [33, 150, 243] as [number, number, number]
const DARK_BG    = [13, 15, 17]  as [number, number, number]
const LIGHT_TEXT = [255, 255, 255] as [number, number, number]
const BODY_TEXT  = [30, 30, 30]  as [number, number, number]

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(...LIGHT_TEXT)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('UNYKORN DATA CENTER OS', 12, 11)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Confidential — Institutional Distribution Only', 12, 17)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 12, 24)
  doc.setTextColor(...BODY_TEXT)
  doc.setFontSize(9)
  doc.text(subtitle, 12, 32)
}

function addFooter(doc: jsPDF, page: number, total: number) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(160, 160, 160)
  doc.text(`UnyKorn DC-OS — Confidential — Page ${page} of ${total}`, 12, h - 6)
  doc.text(new Date().toISOString().split('T')[0], w - 12, h - 6, { align: 'right' })
}

// ── Executive Memo ─────────────────────────────────────────────────────────
export function generateExecutivePdf(site: Record<string, any>): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const scorecard = site.scorecard ?? {}
  const riskFlags = site.riskFlags ?? []
  const critRisks = riskFlags.filter((r: any) => r.severity === 'CRITICAL' && !r.isResolved)

  addHeader(doc, 'SITE EXECUTIVE BRIEF', `${site.name} | ${site.city ?? ''}, ${site.state ?? ''}`)

  let y = 38
  const addSection = (label: string, value: string | null, indent = 12) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(label.toUpperCase(), indent, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BODY_TEXT)
    doc.text(value ?? 'Not specified', indent + 50, y)
    y += 5.5
  }

  addSection('Site Name',       site.name)
  addSection('Location',        [site.city, site.state, site.country].filter(Boolean).join(', '))
  addSection('Site Type',       site.siteType?.replace(/_/g, ' ') ?? null)
  addSection('Pipeline Stage',  site.stage?.replace(/_/g, ' ') ?? null)
  addSection('Ownership',       site.ownershipStatus ?? null)
  addSection('Target IT MW',    site.targetItMW ? `${site.targetItMW} MW` : null)
  addSection('Expandable MW',   site.maxExpandableMW ? `${site.maxExpandableMW} MW` : null)
  y += 3

  // Scorecard summary
  doc.setFillColor(240, 245, 255)
  doc.rect(12, y, 186, 28, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_BLUE)
  const score = scorecard.totalScore
  doc.text(`Overall Score: ${score != null ? score.toFixed(1) + ' / 100' : 'Not Computed'}`, 16, y + 8)
  doc.setFontSize(9)
  doc.setTextColor(...BODY_TEXT)
  doc.setFont('helvetica', 'normal')
  const rec = scorecard.recommendation ?? 'PENDING'
  doc.text(`Recommendation: ${rec.replace(/_/g, ' ')}`, 16, y + 15)
  if (scorecard.rationale) {
    const lines = doc.splitTextToSize(scorecard.rationale, 170)
    doc.setFontSize(7.5)
    doc.text(lines.slice(0, 2), 16, y + 22)
  }
  y += 33

  // Scoring breakdown table
  if (score != null) {
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Score', 'Weight', 'Contribution']],
      body: [
        ['Power Depth & Expandability', `${(scorecard.powerExpandability ?? 0).toFixed(1)}`, '20%', `${((scorecard.powerExpandability ?? 0) * 0.20).toFixed(1)}`],
        ['Strategic Fit',               `${(scorecard.strategicFit ?? 0).toFixed(1)}`,       '15%', `${((scorecard.strategicFit ?? 0) * 0.15).toFixed(1)}`],
        ['Cooling & AI Readiness',      `${(scorecard.coolingAiReadiness ?? 0).toFixed(1)}`, '15%', `${((scorecard.coolingAiReadiness ?? 0) * 0.15).toFixed(1)}`],
        ['Network & Latency',           `${(scorecard.networkLatency ?? 0).toFixed(1)}`,     '10%', `${((scorecard.networkLatency ?? 0) * 0.10).toFixed(1)}`],
        ['Resilience & Security',       `${(scorecard.resilienceSecurity ?? 0).toFixed(1)}`, '10%', `${((scorecard.resilienceSecurity ?? 0) * 0.10).toFixed(1)}`],
        ['Compliance & Sovereignty',    `${(scorecard.complianceSovereignty ?? 0).toFixed(1)}`, '10%', `${((scorecard.complianceSovereignty ?? 0) * 0.10).toFixed(1)}`],
        ['Operational Maturity',        `${(scorecard.operationalMaturity ?? 0).toFixed(1)}`, '10%', `${((scorecard.operationalMaturity ?? 0) * 0.10).toFixed(1)}`],
        ['Financial Attractiveness',    `${(scorecard.financialAttractiveness ?? 0).toFixed(1)}`, '10%', `${((scorecard.financialAttractiveness ?? 0) * 0.10).toFixed(1)}`],
      ],
      headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 249, 255] },
      margin: { left: 12, right: 12 },
    })
    y = (doc as any).lastAutoTable.finalY + 6
  }

  // Critical risks
  if (critRisks.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 50, 50)
    doc.text(`CRITICAL RISKS (${critRisks.length})`, 12, y)
    y += 5
    for (const risk of critRisks.slice(0, 5)) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(180, 30, 30)
      doc.text(`• ${risk.title}`, 14, y)
      y += 4.5
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...BODY_TEXT)
      const lines = doc.splitTextToSize(risk.description, 175)
      doc.text(lines.slice(0, 2), 16, y)
      y += lines.slice(0, 2).length * 4 + 1
    }
  }

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    addFooter(doc, i, total)
  }

  return Buffer.from(doc.output('arraybuffer'))
}

// ── Technical Report ───────────────────────────────────────────────────────
export function generateTechnicalPdf(site: Record<string, any>): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  addHeader(doc, 'TECHNICAL DILIGENCE REPORT', `${site.name}`)

  let y = 40
  const u   = site.utilities?.[0]
  const g   = site.generators?.[0]
  const ups = site.upsSystems?.[0]
  const c   = site.coolingSystems?.[0]
  const n   = site.networkProfiles?.[0]
  const sec = site.securityProfile

  const sections: [string, [string, string | null][]][] = [
    ['Power & Utility', [
      ['Provider', u?.provider],
      ['Delivered MW', u?.deliveredMW ? `${u.deliveredMW} MW` : null],
      ['Feed count', u?.feedCount?.toString()],
      ['Grid reliability', u?.gridReliabilityPercent ? `${u.gridReliabilityPercent}%` : null],
      ['BTM capacity', u?.btmCapacityMW ? `${u.btmCapacityMW} MW` : null],
    ]],
    ['Backup Power', [
      ['Generator count', g?.count?.toString()],
      ['Capacity (kW ea.)', g?.capacityKwEach?.toString()],
      ['Redundancy model', g?.redundancyModel],
      ['Autonomy (hours)', g?.autonomyHours?.toString()],
      ['UPS topology', ups?.topology],
      ['UPS runtime (min)', ups?.runtimeMinutes?.toString()],
    ]],
    ['Cooling', [
      ['Cooling type', c?.coolingType?.replace(/_/g, ' ')],
      ['Max rack kW', c?.maxRackKwSupported?.toString()],
      ['PUE (annual)', c?.pueAnnual?.toFixed(2)],
      ['PUE (target)', c?.pueTarget?.toFixed(2)],
      ['Liquid cooling ready', c?.isLiquidCoolingReady ? 'Yes' : 'No'],
      ['CDU present', c?.hasCdu ? 'Yes' : 'No'],
    ]],
    ['Network', [
      ['Carriers on-site', n?.carriersOnSite?.toString()],
      ['Route diversity', n?.hasRouteDiv ? 'Yes' : 'No'],
      ['Dark fiber', n?.hasDarkFiber ? 'Yes' : 'No'],
      ['IX proximity (mi)', n?.ixProximityMiles?.toString()],
      ['Bandwidth (Tbps)', n?.aggregateBandwidthTbps?.toString()],
    ]],
    ['Security', [
      ['Biometrics', sec?.hasBiometrics ? 'Yes' : 'No'],
      ['Mantraps', sec?.hasMantraps ? 'Yes' : 'No'],
      ['SOC/NOC', sec?.hasSocNoc ? 'Yes' : 'No'],
      ['CCTV (DC)', sec?.hasCctvDataCenter ? 'Yes' : 'No'],
    ]],
  ]

  for (const [title, rows] of sections) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(...BRAND_BLUE)
    doc.setTextColor(...LIGHT_TEXT)
    doc.rect(12, y, 186, 7, 'F')
    doc.text(title.toUpperCase(), 14, y + 5)
    doc.setTextColor(...BODY_TEXT)
    y += 10

    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(label, 16, y)
      doc.setFont('helvetica', 'bold')
      doc.text(value ?? '—', 90, y)
      doc.setFont('helvetica', 'normal')
      y += 5
    }
    y += 4

    if (y > 260) {
      doc.addPage()
      y = 20
    }
  }

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    addFooter(doc, i, total)
  }

  return Buffer.from(doc.output('arraybuffer'))
}
