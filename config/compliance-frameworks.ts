// config/compliance-frameworks.ts
// Recognized compliance certifications + sovereign hosting qualification criteria
// Source: UNYKORN-DataCenter-System-2026.md § Compliance & Sovereignty

export interface ComplianceFramework {
  id: string
  label: string
  abbreviation: string
  description: string
  governingBody: string
  applicableWorkloads: string[]
  renewalCycleYears: number
  auditRequired: boolean
  sopAlignment: boolean
}

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: 'soc2',
    label: 'SOC 2 Type II',
    abbreviation: 'SOC 2',
    description: 'American Institute of CPAs standard covering security, availability, processing integrity, confidentiality, and privacy.',
    governingBody: 'AICPA',
    applicableWorkloads: ['Financial Services', 'SaaS', 'Digital Assets', 'Healthcare Adjacent'],
    renewalCycleYears: 1,
    auditRequired: true,
    sopAlignment: true,
  },
  {
    id: 'iso27001',
    label: 'ISO/IEC 27001:2022',
    abbreviation: 'ISO 27001',
    description: 'International standard for Information Security Management Systems (ISMS).',
    governingBody: 'ISO / IEC',
    applicableWorkloads: ['Enterprise', 'Government', 'Financial Services', 'Healthcare'],
    renewalCycleYears: 3,
    auditRequired: true,
    sopAlignment: true,
  },
  {
    id: 'pcidss',
    label: 'PCI-DSS v4.0',
    abbreviation: 'PCI-DSS',
    description: 'Payment Card Industry Data Security Standard for organizations that handle branded credit cards.',
    governingBody: 'PCI Security Standards Council',
    applicableWorkloads: ['Payments', 'e-Commerce', 'Financial Services'],
    renewalCycleYears: 1,
    auditRequired: true,
    sopAlignment: true,
  },
  {
    id: 'hipaa',
    label: 'HIPAA Security Rule',
    abbreviation: 'HIPAA',
    description: 'US federal standard for protecting health information (PHI) in electronic form.',
    governingBody: 'US Dept. of Health and Human Services',
    applicableWorkloads: ['Healthcare', 'Life Sciences', 'Insurance'],
    renewalCycleYears: 1,
    auditRequired: false,
    sopAlignment: true,
  },
  {
    id: 'fedramp',
    label: 'FedRAMP Authorized',
    abbreviation: 'FedRAMP',
    description: 'Federal Risk and Authorization Management Program — US Federal cloud security authorization.',
    governingBody: 'GSA / OMB',
    applicableWorkloads: ['US Federal Government', 'Defense', 'Intelligence'],
    renewalCycleYears: 1,
    auditRequired: true,
    sopAlignment: true,
  },
  {
    id: 'cjis',
    label: 'CJIS Security Policy',
    abbreviation: 'CJIS',
    description: 'FBI Criminal Justice Information Services Security Policy v5.x — required for law enforcement data hosting.',
    governingBody: 'FBI / CJIS Division',
    applicableWorkloads: ['Law Enforcement', 'Government', 'Sovereign'],
    renewalCycleYears: 2,
    auditRequired: true,
    sopAlignment: true,
  },
  {
    id: 'iso50001',
    label: 'ISO 50001 Energy Management',
    abbreviation: 'ISO 50001',
    description: 'International standard for energy management systems — demonstrates operational energy efficiency.',
    governingBody: 'ISO',
    applicableWorkloads: ['ESG Reporting', 'Sustainability', 'Corporate Real Estate'],
    renewalCycleYears: 3,
    auditRequired: true,
    sopAlignment: false,
  },
  {
    id: 'nist',
    label: 'NIST CSF 2.0',
    abbreviation: 'NIST',
    description: 'National Institute of Standards and Technology Cybersecurity Framework for critical infrastructure.',
    governingBody: 'NIST',
    applicableWorkloads: ['Critical Infrastructure', 'Defense Industrial Base', 'Energy'],
    renewalCycleYears: 2,
    auditRequired: false,
    sopAlignment: true,
  },
]

// Sovereign hosting qualification thresholds
export const SOVEREIGN_HOSTING_REQUIREMENTS = {
  requiredCertifications: ['soc2', 'iso27001'],
  optionalBonusCerts:     ['cjis', 'fedramp', 'nist'],
  requiredSecurity:       ['hasMantraps', 'hasBiometrics', 'hasSocNoc', 'hasCctvDataCenter'],
  minUptimeTier:          'Tier III',
  note: 'Sites hosting sovereign or classified workloads must satisfy all required certifications AND security controls below.',
}

// Financial infrastructure suitability criteria
export const FINANCIAL_INFRA_REQUIREMENTS = {
  requiredCertifications: ['soc2', 'pcidss'],
  requiredSecurity:       ['hasBiometrics', 'hasSocNoc', 'hasMantraps'],
  note: 'Financial infrastructure (trading, clearing, custody, digital assets) requires SOC 2 + PCI-DSS at minimum.',
}
