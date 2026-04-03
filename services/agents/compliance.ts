// services/agents/compliance.ts
// ComplianceAgent — certifications, sovereign hosting criteria, financial infrastructure qualification

import { BaseAgent, type AgentInput } from './base'
import type { AgentOutputPayload } from '@/types'

export class ComplianceAgent extends BaseAgent {
  readonly agentType = 'COMPLIANCE' as const
  readonly displayName = 'Compliance & Sovereignty Agent'

  protected async execute(
    input: AgentInput,
    site: Record<string, unknown>,
  ): Promise<AgentOutputPayload> {
    const facts = []
    const risks = []
    const recs  = []
    const missing: string[] = []

    const comp = site.complianceProfile as Record<string, any> | null
    const sec  = site.securityProfile  as Record<string, any> | null

    if (!comp) {
      missing.push('Compliance profile (SOC, ISO, PCI, etc.)')
      risks.push(this.risk('COMPLIANCE_REGULATORY', 'HIGH', 'No compliance profile',
        'Compliance profile has not been created. Cannot evaluate certification status or workload eligibility.',
        'Complete compliance section including all applicable certifications and attestations.'))
    } else {
      // Certifications
      const certs: [string, boolean, string][] = [
        ['hasSoc2',      comp.hasSoc2      ?? false, 'SOC 2 Type II'],
        ['hasIso27001',  comp.hasIso27001  ?? false, 'ISO 27001'],
        ['hasPciDss',    comp.hasPciDss    ?? false, 'PCI-DSS'],
        ['hasHipaa',     comp.hasHipaa     ?? false, 'HIPAA'],
        ['hasFedRamp',   comp.hasFedRamp   ?? false, 'FedRAMP'],
        ['hasCjis',      comp.hasCjis      ?? false, 'CJIS'],
        ['hasIso50001',  comp.hasIso50001  ?? false, 'ISO 50001'],
      ]
      for (const [field, val, label] of certs) {
        if (val) facts.push(this.fact(`complianceProfile.${field}`, label, 'Certified', 0.9))
      }

      // Sovereign hosting assessment
      if (comp.sovereignHostingSuitable) {
        facts.push(this.fact('complianceProfile.sovereignHostingSuitable', 'Sovereign hosting suitable', true, 0.85))
        // Verify physical security
        if (!sec?.hasMantraps || !sec?.hasBiometrics || !sec?.hasSocNoc) {
          risks.push(this.risk('COMPLIANCE_REGULATORY', 'HIGH', 'Sovereign flag but security gaps',
            'Sovereign hosting suitability flag is set, but one or more required physical security controls (mantraps, biometrics, 24/7 SOC/NOC) are not confirmed.',
            'Confirm all physical security controls per agency sovereign hosting requirements before presenting this site for government workloads.'))
        } else {
          recs.push(this.rec('COMPLIANCE',
            'Site meets physical security requirements for sovereign hosting — prepare attestation package for FedRAMP or agency pre-authorization review.',
            0.85))
        }
      }

      // Financial infra assessment
      if (comp.financialInfraSuitable) {
        facts.push(this.fact('complianceProfile.financialInfraSuitable', 'Financial infrastructure suitable', true, 0.85))
        if (!comp.hasSoc2) {
          risks.push(this.risk('COMPLIANCE_REGULATORY', 'CRITICAL', 'Financial-infra flag without SOC 2',
            'Site is flagged as financial-infrastructure-suitable, but SOC 2 Type II certification is absent. This is disqualifying for regulated banking, clearing, and insurance workloads.',
            'Remove financial-infra suitability flag until SOC 2 Type II is in place, or document compensating controls.'))
        }
        if (!comp.hasIso27001) {
          risks.push(this.risk('COMPLIANCE_REGULATORY', 'HIGH', 'ISO 27001 absent for financial-infra site',
            'ISO 27001 is effectively required for systematic financial infrastructure workloads and lender diligence.'))
        }
      }

      // CJIS deep check
      if (comp.hasCjis) {
        const physicalOk = sec?.hasMantraps && sec?.hasBiometrics && sec?.hasSocNoc && sec?.hasCctvDataCenter
        if (!physicalOk) {
          risks.push(this.risk('COMPLIANCE_REGULATORY', 'CRITICAL', 'CJIS marked but physical controls incomplete',
            'CJIS Security Policy requires biometric multi-factor access, mantraps, 24/7 monitoring, and CCTV. One or more are not confirmed.',
            'Complete physical security audit against FBI CJIS Security Policy §5.9 before hosting law enforcement or criminal justice agency data.'))
        }
      }

      // Digital asset
      if (comp.digitalAssetSuitable) {
        facts.push(this.fact('complianceProfile.digitalAssetSuitable', 'Digital asset / blockchain hosting suitable', true, 0.8))
        recs.push(this.rec('COMPLIANCE',
          'Digital asset flag set — document Apostle Chain / USDF hosting policy and customer data residency controls.',
          0.7))
      }

      // Uptime tier
      if (comp.uptierCertification) {
        facts.push(this.fact('complianceProfile.uptierCertification', 'Uptime Institute tier', comp.uptierCertification, 0.9))
        if (!comp.uptierCertification.includes('III') && !comp.uptierCertification.includes('IV')) {
          risks.push(this.risk('COMPLIANCE_REGULATORY', 'MEDIUM', 'Tier I or II classification',
            `Site is classified as ${comp.uptierCertification}. Many enterprise and sovereign customers require Tier III or IV certification.`,
            'Evaluate upgrade path or qualify workloads that can accept lower SLA.'))
        }
      } else {
        missing.push('Uptime Institute tier certification')
      }
    }

    const filledFields = comp ? Object.values(comp).filter(v => v != null && v !== false).length : 0
    const confidence = comp ? Math.min(0.9, filledFields / 10) : 0.1

    return {
      agentType: 'COMPLIANCE',
      siteId: input.siteId,
      summary: `Compliance review: ${comp?.hasSoc2 ? 'SOC 2 ✓' : 'SOC 2 ✗'}, ${comp?.hasIso27001 ? 'ISO 27001 ✓' : 'ISO 27001 ✗'}, Sovereign ${comp?.sovereignHostingSuitable ? '✓' : '✗'}, Financial Infra ${comp?.financialInfraSuitable ? '✓' : '✗'}. ${risks.length} risk(s) detected.`,
      confidence,
      extractedFacts: facts,
      riskFlags: risks,
      recommendations: recs,
      missingCriticalFields: missing,
    }
  }
}

export const complianceAgent = new ComplianceAgent()
