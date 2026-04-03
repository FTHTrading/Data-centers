// services/agents/document-extraction.ts
// DocumentExtractionAgent — reads uploaded attachments, extracts structured facts via pattern matching

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'
import { db } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

// Regex-based extractors for common values in DC documents
const EXTRACTORS: { label: string; fieldPath: string; pattern: RegExp; transform?: (m: string) => string }[] = [
  { label: 'Delivered MW',       fieldPath: 'utilities.0.deliveredMW',      pattern: /(\d+(?:\.\d+)?)\s*MW\s+(?:available|delivered|committed|contracted)/i },
  { label: 'Expandable MW',      fieldPath: 'utilities.0.expandableMW',     pattern: /(?:expand|additional|future)\s+(?:capacity of\s+)?(\d+(?:\.\d+)?)\s*MW/i },
  { label: 'PUE',                fieldPath: 'coolingSystems.0.pueAnnual',   pattern: /PUE\s+(?:of\s+)?(\d+\.\d+)/i },
  { label: 'Utility provider',   fieldPath: 'utilities.0.provider',         pattern: /(?:provider|utility|power provided by)[:\s]+([A-Za-z &]+?)(?:\n|,|\.)/i },
  { label: 'Fiber carriers',     fieldPath: 'networkProfiles.0.carriersOnSite', pattern: /(\d+)\s+(?:fiber\s+)?carrier/i },
  { label: 'Generator count',    fieldPath: 'generators.0.count',           pattern: /(\d+)\s+generator/i },
  { label: 'Generator kW',       fieldPath: 'generators.0.capacityKwEach',   pattern: /(\d+(?:,\d+)?)\s*(?:k[Ww]|kilowatt)/i, transform: s => s.replace(',', '') },
  { label: 'UPS runtime (min)',  fieldPath: 'upsSystems.0.runtimeMinutes',  pattern: /(?:UPS|battery)\s+(?:runtime|autonomy|bridge|hold-up)\s+(?:of\s+)?(\d+)\s*min/i },
  { label: 'Rack density (kW)',  fieldPath: 'coolingSystems.0.maxRackKwSupported', pattern: /(\d+)\s*kW\s+per\s*rack/i },
  { label: 'Total sq ft',        fieldPath: 'buildings.0.totalSqFt',        pattern: /(\d+(?:,\d+)*)\s*(?:sq\.?\s*ft|square feet)/i, transform: s => s.replace(/,/g, '') },
  { label: 'Acres',              fieldPath: 'totalAcres',                    pattern: /(\d+(?:\.\d+)?)\s*(?:gross\s+)?acres?/i },
  { label: 'Year built',         fieldPath: 'buildings.0.yearBuilt',         pattern: /(?:built|constructed|completed)\s+(?:in\s+)?(\d{4})/i },
  { label: 'Power price $/kWh',  fieldPath: 'environmentalProfile.ppaPricePerKwh', pattern: /\$?(\d+\.\d+)\s*(?:per\s+)?kWh/i },
]

export class DocumentExtractionAgent extends BaseAgent {
  readonly agentType = 'DOCUMENT_EXTRACTION' as const
  readonly displayName = 'Document Extraction Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts: any[] = []
    const risks: any[] = []
    const recs: any[]  = []

    // Load attachment text
    let text = ''
    if (input.attachmentId) {
      const attachment = await db.attachment.findUnique({ where: { id: input.attachmentId } })
      if (attachment) {
        try {
          const storagePath = process.env.FILE_STORAGE_PATH ?? './uploads'
          const filePath = join(storagePath, attachment.storageKey)
          text = readFileSync(filePath, 'utf8')
        } catch {
          // File not readable as text — PDF extraction would need additional tooling
          text = ''
        }
      }
    }

    if (!text) {
      recs.push(this.rec('EXTRACTION',
        'Document content not available for text extraction — PDF binary processing requires OCR pipeline. Manually review and enter key values.',
        0.5))

      return {
        agentType: 'DOCUMENT_EXTRACTION',
        siteId: input.siteId,
        summary: 'Document text not extractable — manual review required.',
        confidence: 0.1,
        extractedFacts: [],
        riskFlags: [],
        recommendations: recs,
        missingCriticalFields: [],
      }
    }

    // Run all extractors
    for (const ex of EXTRACTORS) {
      const match = ex.pattern.exec(text)
      if (match) {
        const raw = match[1]
        const value = ex.transform ? ex.transform(raw) : raw
        const snippet = text.slice(Math.max(0, match.index - 40), match.index + 80).replace(/\n/g, ' ')
        facts.push(this.fact(ex.fieldPath, ex.label, value, 0.75, snippet))
      }
    }

    // Check for compliance keywords
    const complianceKeywords: [string, string][] = [
      ['SOC 2', 'complianceProfile.hasSoc2'],
      ['ISO 27001', 'complianceProfile.hasIso27001'],
      ['PCI-DSS', 'complianceProfile.hasPciDss'],
      ['HIPAA', 'complianceProfile.hasHipaa'],
      ['FedRAMP', 'complianceProfile.hasFedRamp'],
      ['CJIS', 'complianceProfile.hasCjis'],
    ]
    for (const [keyword, fieldPath] of complianceKeywords) {
      if (new RegExp(keyword.replace(/[- ]/g, '[- ]?'), 'i').test(text)) {
        facts.push(this.fact(fieldPath, keyword + ' mention', 'true', 0.7,
          'Keyword detected in document — requires manual verification', true))
      }
    }

    if (facts.length === 0) {
      recs.push(this.rec('EXTRACTION',
        'No structured facts extracted from document — content may be image-only or use non-standard terminology. Manual review recommended.',
        0.6))
    } else {
      recs.push(this.rec('EXTRACTION',
        `${facts.length} fact(s) extracted. Review each in the Facts Review panel before applying to site record.`,
        0.85))
    }

    const confidence = Math.min(0.85, facts.length * 0.06 + 0.1)

    return {
      agentType: 'DOCUMENT_EXTRACTION',
      siteId: input.siteId,
      summary: `Extracted ${facts.length} structured fact(s) from document. All require human review before application.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: [],
    }
  }
}

export const documentExtractionAgent = new DocumentExtractionAgent()
