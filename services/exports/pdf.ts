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

// ── DC Institutional Guide ─────────────────────────────────────────────────
export function generateDCGuidePdf(): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  let y = 0

  // Cover page
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, W, 297, 'F')
  doc.setTextColor(...LIGHT_TEXT)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INSTITUTIONAL', W / 2, 80, { align: 'center' })
  doc.text('DATA CENTER', W / 2, 98, { align: 'center' })
  doc.text('PLAYBOOK', W / 2, 116, { align: 'center' })
  doc.setFillColor(255, 255, 255)
  doc.rect(40, 125, 130, 0.8, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Market Intel  |  Site Evaluation  |  Capital Strategy  |  Due Diligence', W / 2, 133, { align: 'center' })
  doc.setFontSize(9)
  doc.text('UnyKorn DC-OS  |  FTH Trading  |  Confidential', W / 2, 148, { align: 'center' })
  doc.text(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), W / 2, 157, { align: 'center' })
  doc.setFontSize(8)
  doc.setTextColor(200, 220, 255)
  doc.text('CONFIDENTIAL - FOR AUTHORIZED INSTITUTIONAL USE ONLY', W / 2, 275, { align: 'center' })

  const sectionStart = (title: string, subtitle: string) => {
    doc.addPage()
    y = 0
    doc.setFillColor(...BRAND_BLUE)
    doc.rect(0, 0, W, 28, 'F')
    doc.setTextColor(...LIGHT_TEXT)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('UNYKORN DC-OS - INSTITUTIONAL PLAYBOOK', 12, 11)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(title, 12, 21)
    doc.setTextColor(...BODY_TEXT)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(subtitle, 12, 35)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.line(12, 38, 198, 38)
    y = 44
  }

  const wrap = (text: string, indent = 12) => {
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...BODY_TEXT)
    const lines = doc.splitTextToSize(text, W - indent - 12)
    doc.text(lines, indent, y)
    y += lines.length * 4.5 + 2
    if (y > 272) { doc.addPage(); y = 20 }
  }

  const bul = (text: string) => {
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...BODY_TEXT)
    const lines = doc.splitTextToSize(`-  ${text}`, 170)
    doc.text(lines, 18, y)
    y += lines.length * 4.5 + 1
    if (y > 272) { doc.addPage(); y = 20 }
  }

  const sub = (text: string) => {
    y += 4
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_BLUE)
    doc.text(text.toUpperCase(), 12, y)
    y += 6
    doc.setTextColor(...BODY_TEXT)
  }

  const statRow = (items: [string, string][]) => {
    const cols = items.length
    const colW = (W - 24) / cols
    for (let i = 0; i < cols; i++) {
      const x = 12 + i * colW
      doc.setFillColor(240, 246, 255)
      doc.rect(x, y, colW - 2, 20, 'F')
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_BLUE)
      doc.text(items[i][1], x + (colW - 2) / 2, y + 11, { align: 'center' })
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(110, 110, 110)
      doc.text(items[i][0], x + (colW - 2) / 2, y + 17, { align: 'center' })
    }
    y += 24
    if (y > 272) { doc.addPage(); y = 20 }
  }

  // SECTION 1: MARKET
  sectionStart('SECTION 1', 'Market Overview & Opportunity')
  wrap(
    'The global data center market is one of the most durable infrastructure investment categories of the decade. ' +
    'AI compute demand, cloud migration, and edge deployments have compressed available power capacity in primary ' +
    'markets to record lows — driving lease rates and valuations to all-time highs. Over $200B of institutional ' +
    'capital is committed to data center development globally through 2026.'
  )
  y += 4
  statRow([['Global Market 2024', '$220B+'], ['CAGR 2024-2030', '22%+'], ['AI Demand Growth YoY', '40%+']])
  statRow([['Primary Markets w/ Power', '<5%'], ['Avg Hyperscaler Lease', '10+ yrs'], ['Wholesale $/kW/mo', '$80-$150']])

  sub('Top US Markets')
  autoTable(doc, {
    startY: y,
    head: [['Market', 'State', 'Key Drivers', 'Power', 'Lease Rate/kW/mo']],
    body: [
      ['Northern Virginia', 'VA', 'Hyperscale hub, fiber density', 'CONSTRAINED', '$120-$160'],
      ['Dallas/Fort Worth', 'TX', 'Low tax, deregulated grid', 'MODERATE', '$90-$120'],
      ['Phoenix/Goodyear', 'AZ', 'Utility power, low seismic', 'MODERATE', '$95-$130'],
      ['Atlanta', 'GA', 'Network IX hub', 'MODERATE', '$85-$110'],
      ['Chicago', 'IL', 'Finance sector, carrier dense', 'TIGHT', '$100-$140'],
      ['Columbus', 'OH', 'Hyperscale greenfield, low cost', 'EXCELLENT', '$80-$100'],
      ['Reno/Sparks', 'NV', 'Nevada tax, renewables', 'GOOD', '$80-$105'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  sub('What Is Driving Demand')
  bul('Generative AI & GPU Clusters: LLM training requires 10-100MW+ dedicated GPU fabric per campus')
  bul('Enterprise Cloud Migration: 65%+ of enterprise workloads projected cloud-hosted by 2027')
  bul('Edge Compute: <10ms latency requirements for autonomous vehicles, AR/VR, gaming')
  bul('Government & Defense: CMMC, FedRAMP, IL4/IL5 sovereign requirements creating captive demand')
  bul('Crypto & Blockchain: Variable demand, power-intensive, shorter lease terms typical')

  // SECTION 2: SCORING
  sectionStart('SECTION 2', 'The 8-Category Site Scoring Framework')
  wrap('Every site is evaluated across eight weighted categories producing a 0-100 composite score. ' +
    'This framework drives Flagship, Strategic, Standard, Watchlist, and Reject classifications.')
  y += 4
  autoTable(doc, {
    startY: y,
    head: [['#', 'Category', 'Weight', 'Green Threshold']],
    body: [
      ['1', 'Power Depth & Expandability', '20%', '>=50MW expandable, >=99.9% grid reliability'],
      ['2', 'Strategic Fit', '15%', 'Tier I/II market, >=$10M incentive program'],
      ['3', 'Cooling & AI Readiness', '15%', 'PUE <1.40, >=20kW/rack, liquid cooling ready'],
      ['4', 'Network & Latency', '10%', '>=3 carriers, diverse routes, <50mi from IX'],
      ['5', 'Resilience & Security', '10%', 'N+1 generators, 72hr fuel, biometrics, SOC'],
      ['6', 'Compliance & Sovereignty', '10%', 'SOC 2 T2, ISO 27001, Uptime Tier III+'],
      ['7', 'Operational Maturity', '10%', 'DCIM deployed, CMMS, 24/7 NOC on-site'],
      ['8', 'Financial Attractiveness', '10%', 'YoC >=10%, DSCR >=1.25x, LTV <=65%'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 55 }, 2: { cellWidth: 16 } },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  sub('Score Recommendations')
  autoTable(doc, {
    startY: y,
    head: [['Tier', 'Score', 'Meaning', 'Action']],
    body: [
      ['FLAGSHIP FIT',  '82-100', 'Exceptional across all categories',          'Immediate LOI / IC approval'],
      ['STRATEGIC FIT', '65-81',  'Strong with manageable gaps',                'Advance to Phase II DD'],
      ['STANDARD',      '50-64',  'Meets baseline, repositioning possible',     'Conditional advance'],
      ['WATCHLIST',     '35-49',  'Material gaps requiring mitigants',          'Hold pending utility/rezoning'],
      ['REJECT',        '0-34',   'Fails institutional minimums',               'Pass - document in audit log'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // SECTION 3: POWER
  sectionStart('SECTION 3', 'Power Infrastructure Deep Dive')
  sub('Why Power Is Everything')
  wrap('Power is the single most critical constraint in data center development. A site scoring perfectly ' +
    'on all other dimensions is instantly disqualified if utility power cannot be secured. Key facts:')
  bul('Utility type: IOUs vs cooperatives vs municipal - affects rate negotiation and interconnection speed')
  bul('Grid reliability target: >=99.9% uptime (<=8.76 hrs downtime/year). Request SAIDI/SAIFI statistics.')
  bul('Feed count: Minimum 2 independent feeders from separate substations. Single-feed = Tier III+ disqualifier.')
  bul('Interconnection study: MISO/PJM/ERCOT queue positions often represent 3-7 years for new capacity.')
  bul('BTM solar/battery: Reduces peak demand charges, adds resilience, qualifies for 30% federal ITC.')
  bul('Rate class: Confirm utility has experience with Large Power Industrial data center loads.')
  y += 4

  sub('Backup Power Standards')
  autoTable(doc, {
    startY: y,
    head: [['Spec', 'Tier I (Min)', 'Tier II/III (Target)', 'Tier IV (Best-in-Class)']],
    body: [
      ['Redundancy', 'N', 'N+1', '2N or 2(N+1)'],
      ['Fuel Autonomy', '8 hours', '48 hours', '96+ hours'],
      ['Fuel Type', 'Diesel No. 2', 'Diesel + biodiesel blend', 'Dual-fuel (LNG + diesel)'],
      ['Transfer Time', '<30 seconds', '<10 seconds', '<5 seconds (static)'],
      ['Load Testing', 'Annual at 25%', 'Quarterly full load bank', 'Monthly + remote telemetry'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // SECTION 4: COOLING
  sectionStart('SECTION 4', 'Cooling & AI Readiness')
  sub('PUE - Power Usage Effectiveness')
  wrap('PUE = Total Facility Power / IT Equipment Power. Lower = better. PUE 1.0 is theoretical perfection.')
  statRow([['Industry Avg PUE', '1.58'], ['Modern Hyperscaler', '1.12'], ['AI GPU Optimal', '<1.20']])
  statRow([['Legacy Threshold', '>1.60'], ['WUE Target (gal/kWh)', '<1.0'], ['Tax Incentive Floor', '1.40']])

  sub('Cooling Technology Comparison')
  autoTable(doc, {
    startY: y,
    head: [['Cooling Type', 'Max Rack Density', 'PUE Range', 'AI Ready', 'Est. CAPEX/kW']],
    body: [
      ['Air-cooled CRAC/CRAH', '<10 kW/rack',    '1.40-1.80', 'No',      '$800-$1,200'],
      ['Hot/Cold Aisle Contain.','10-20 kW/rack', '1.25-1.50', 'Partial', '$1,000-$1,400'],
      ['Rear-Door Heat Exchanger','20-35 kW/rack','1.15-1.35', 'Partial', '$1,200-$1,600'],
      ['Direct Liquid (DLC)',    '30-100 kW/rack','1.05-1.20', 'Yes',     '$1,500-$2,200'],
      ['Immersion (Single Phase)','50-200 kW/rack','1.02-1.10','Yes',     '$2,000-$3,500'],
      ['Immersion (Two Phase)',  '100-300 kW/rack','1.01-1.05','Yes',     '$3,000-$6,000'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  sub('AI GPU Cluster Power Requirements')
  bul('NVIDIA H100/H200 SXM: 700W TDP per GPU; 8-GPU DGX nodes = 10-14kW per rack with networking')
  bul('NVIDIA GB200 NVL72: 120kW per rack - air cooling is NOT viable; liquid cooling required')
  bul('AMD MI300X: 750W per GPU; up to 15kW per rack; liquid cooling strongly preferred')
  bul('Future-proof design: Size floor for 1,200 lbs/rack load; rough-in CDU piping for all new builds')

  // SECTION 5: CAPITAL STACK
  sectionStart('SECTION 5', 'Capital Stack & Financial Metrics')
  sub('Development Cost Structure')
  autoTable(doc, {
    startY: y,
    head: [['Cost Component', 'Shell Only', 'Warm Shell', 'Fully Fitted']],
    body: [
      ['Land Acquisition', '$0.5-2M/acre', '$0.5-2M/acre', '$0.5-2M/acre'],
      ['Shell Construction', '$200-350/sqft', '$250-400/sqft', '$300-500/sqft'],
      ['Power Infrastructure', '$2-4M/MW', '$3-6M/MW', '$5-10M/MW'],
      ['Cooling Systems', '$0.5-1M/MW', '$1-2M/MW', '$2-4M/MW'],
      ['Network Entrance', '$500K-2M', '$1-3M', '$2-5M'],
      ['TOTAL COST / MW', '$8-12M/MW', '$12-16M/MW', '$14-22M/MW'],
      ['Revenue / MW / Year', '$1.0-1.4M', '$1.5-2.0M', '$2.0-3.0M'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 8
  if (y > 265) { doc.addPage(); y = 20 }

  sub('Key Investment KPIs')
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Formula', 'Institutional Target', 'Red Flag']],
    body: [
      ['Yield on Cost (YoC)', 'Stabilized NOI / Total Dev. Cost', '>=10.0%', '<8.0%'],
      ['DSCR', 'NOI / Annual Debt Service', '>=1.25x', '<1.10x'],
      ['LTV', 'Senior Debt / Appraised Value', '<=65%', '>75%'],
      ['Stabilized Cap Rate', 'NOI / Stabilized Value', '5.5-7.5%', '>9%'],
      ['Leveraged IRR', '5-year exit model', '18-25%', '<14%'],
      ['Equity Multiple', 'Total Return / Equity Invested', '>=2.0x (5yr)', '<1.5x'],
      ['Price per MW', 'Purchase Price / IT MW', '$5-18M/MW', '>$20M/MW'],
      ['EBITDA Margin', 'EBITDA / Revenue', '>=45%', '<35%'],
    ],
    headStyles: { fillColor: BRAND_BLUE, textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // SECTION 6: RED FLAGS
  sectionStart('SECTION 6', 'Red Flags & Automatic Disqualifiers')
  sub('Automatic Disqualifiers - Any One = PASS')
  autoTable(doc, {
    startY: y,
    head: [['#', 'Disqualifier', 'Reason']],
    body: [
      ['1', 'Single utility feed, no redundancy path', 'Any outage = full downtime; Tier II+ insurance unattainable'],
      ['2', 'Site in FEMA 100-year flood plain (Zone AE/AO)', 'Insurance cost prohibitive; CoLo contracts prohibit'],
      ['3', 'Utility refuses written MW capacity commitment', 'Phantom capacity - routinely strands development capital'],
      ['4', 'Phase II ESA reveals recognized environmental conditions', 'Remediation cost/timeline destroys return profile'],
      ['5', 'Zoning prohibits data center or generator use', 'Variance is multi-year; NIMBY risk is severe'],
      ['6', 'Active fault within seismic setback (Zone 4)', 'Structural hardening adds $3-8M/MW - kills pencil'],
      ['7', 'Undischarged title liens > 5% of site value', 'Clean acquisition closing not possible'],
    ],
    headStyles: { fillColor: [180, 30, 30] as [number, number, number], textColor: LIGHT_TEXT, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [255, 245, 245] },
    columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 72 } },
    margin: { left: 12, right: 12 },
  })
  y = (doc as any).lastAutoTable.finalY + 8
  if (y > 265) { doc.addPage(); y = 20 }

  sub('Material Risk Flags - Mitigation Plan Required')
  bul('PUE > 1.60: Legacy facility; complete cooling retrofit required to compete on lease rates')
  bul('Only 1-2 carrier providers: Tenants will not sign long-term leases without network redundancy')
  bul('Generator autonomy < 24 hours: Disqualifying for government/defense/regulated workloads')
  bul('No DCIM platform: Reactive operations lead to predictive failures and tenant churn')
  bul('Cooling air-only, no liquid rough-in: Ineligible for GPU/HPC tenants without $3-8M/MW retrofit')
  bul('Tax abatement contingent on a vote not yet held: Underwrite without it entirely')

  // SECTION 7: DD CHECKLIST
  sectionStart('SECTION 7', 'Institutional Due Diligence Checklist')

  sub('Power & Utility')
  bul('[ ] Utility Letter of Intent / capacity allocation letter (MW committed, timeline confirmed)')
  bul('[ ] Interconnection study results (Phase I & Phase II) from MISO/PJM/ERCOT/WECC')
  bul('[ ] Substation engineering report - existing capacity vs. planned load')
  bul('[ ] Grid reliability statistics (SAIDI/SAIFI) from utility for prior 5 years')
  bul('[ ] Rate schedule confirmation - Large Power Industrial (LPI) class or equivalent')
  bul('[ ] Generator fuel supply contract + tank capacity validation')
  bul('[ ] BTM solar/battery feasibility study with ITC qualification memo')
  bul('[ ] Electrical single-line diagram reviewed by licensed Professional Engineer')

  sub('Physical & Environmental')
  bul('[ ] Phase I Environmental Site Assessment - no Recognized Environmental Conditions (RECs)')
  bul('[ ] ALTA/NSPS survey and title report - confirm clean title')
  bul('[ ] Zoning confirmation letter: data center use confirmed as-of-right')
  bul('[ ] FEMA flood map review - confirm Zone X (minimal hazard)')
  bul('[ ] Seismic hazard assessment - structural compliance per local code')
  bul('[ ] Geotechnical report - soil bearing capacity for raised floor + generator pads')
  bul('[ ] All existing building permits confirmed - no unpermitted construction')

  sub('Network & Connectivity')
  bul('[ ] Carrier LOIs from >=3 independent fiber providers confirming on-net capability')
  bul('[ ] Fiber route diversity map - no single point of entry to building')
  bul('[ ] Dark fiber availability confirmed from CLEC or IRU provider')
  bul('[ ] IX proximity: latency to nearest major IX documented (<50 miles target)')

  sub('Financial & Legal')
  bul('[ ] Independent third-party appraisal (as-is and as-stabilized)')
  bul('[ ] Construction budget signed by GC - GMP or cost-plus with hard cap')
  bul('[ ] 10% construction contingency reserved in proforma')
  bul('[ ] 5-year operating proforma: revenue, opex, NOI, debt service, DSCR model')
  bul('[ ] Tax abatement agreement confirmed - or proforma underwritten entirely without it')
  bul('[ ] Insurance binders: property, business interruption, cyber liability, E&O')

  sub('Operations & Compliance')
  bul('[ ] DCIM software selected and integration timeline confirmed')
  bul('[ ] SOC 2 Type II readiness assessment or certification in place')
  bul('[ ] ISO 27001 gap analysis completed')
  bul('[ ] Uptime Institute Tier certification path confirmed with consultant')
  bul('[ ] Fire suppression compliant with NFPA 75 and local AHJ approval')
  bul('[ ] Business Continuity / Disaster Recovery plan documented (BCP/DRP)')

  const pageCount = doc.getNumberOfPages()
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i)
    addFooter(doc, i - 1, pageCount - 1)
  }

  return Buffer.from(doc.output('arraybuffer'))
}
