// config/jurisdictions.ts
// Top-tier data center jurisdictions ranked per UNYKORN-DataCenter-System-2026.md

export interface JurisdictionProfile {
  id: string
  state: string
  country: string
  rank: number
  label: string
  energyCostPerKwh: number
  taxIncentives: string[]
  dataCenterLaw: boolean
  cryptoFriendly: boolean
  sovereignSuitable: boolean
  climateRisk: 'Low' | 'Medium' | 'High'
  notes: string
}

export const JURISDICTIONS: JurisdictionProfile[] = [
  {
    id: 'wy', state: 'WY', country: 'US', rank: 1,
    label: 'Wyoming',
    energyCostPerKwh: 0.048,
    taxIncentives: ['No state income tax', 'No corporate income tax', 'Data center sales tax exemption', 'Property tax abatement available'],
    dataCenterLaw: true, cryptoFriendly: true, sovereignSuitable: true,
    climateRisk: 'Low',
    notes: 'Top-ranked for sovereign hosting. CJIS-friendly. Cheyenne is prime due to fiber access to Denver and proximity to major cloud on-ramps.',
  },
  {
    id: 'tx', state: 'TX', country: 'US', rank: 2,
    label: 'Texas (ERCOT)',
    energyCostPerKwh: 0.038,
    taxIncentives: ['Chapter 313 successor incentives', 'No income tax', 'Sales tax exemption for DC equipment', 'Texas enterprise fund'],
    dataCenterLaw: true, cryptoFriendly: true, sovereignSuitable: false,
    climateRisk: 'Medium',
    notes: 'Lowest energy cost in portfolio via solar PPA. ERCOT grid requires careful demand management. Western TX (Permian/Pecos area) preferred for AI workloads.',
  },
  {
    id: 'nd', state: 'ND', country: 'US', rank: 3,
    label: 'North Dakota',
    energyCostPerKwh: 0.052,
    taxIncentives: ['100% sales tax exemption', 'Property tax exemption up to 5 years', 'Workforce development credits'],
    dataCenterLaw: true, cryptoFriendly: true, sovereignSuitable: true,
    climateRisk: 'Low',
    notes: 'Excellent for flared-gas / DFM operations. Williston Basin energy advantage. Geographic isolation is a network risk.',
  },
  {
    id: 'va', state: 'VA', country: 'US', rank: 4,
    label: 'Virginia (NoVA)',
    energyCostPerKwh: 0.065,
    taxIncentives: ['Full sales tax exemption on DC equipment', 'Local enterprise zone credits'],
    dataCenterLaw: true, cryptoFriendly: false, sovereignSuitable: false,
    climateRisk: 'Low',
    notes: 'Highest density of cloud PoPs globally. Power constraints real in Loudoun County. Best for latency-critical finance/cloud workloads.',
  },
  {
    id: 'nv', state: 'NV', country: 'US', rank: 5,
    label: 'Nevada (Reno)',
    energyCostPerKwh: 0.055,
    taxIncentives: ['No state income tax', 'Sales tax exemption', 'Personal property tax abatement'],
    dataCenterLaw: true, cryptoFriendly: true, sovereignSuitable: true,
    climateRisk: 'Medium',
    notes: 'Reno specifically excellent for CA-adjacent latency. Apple, Tesla Gigafactory proximity. Water risk in long-term climate scenario.',
  },
  {
    id: 'az', state: 'AZ', country: 'US', rank: 6,
    label: 'Arizona (Phoenix/Chandler)',
    energyCostPerKwh: 0.055,
    taxIncentives: ['TPT exemption for DC equipment', 'GPLET incentive program'],
    dataCenterLaw: true, cryptoFriendly: true, sovereignSuitable: false,
    climateRisk: 'High',
    notes: 'Excellent carrier density and cloud presence. Extreme heat (115°F+) adds cooling burden. Water scarcity emerging as systemic risk.',
  },
  {
    id: 'sd', state: 'SD', country: 'US', rank: 7,
    label: 'South Dakota',
    energyCostPerKwh: 0.057,
    taxIncentives: ['No state income tax', 'No corporate income tax', 'REAP grants available'],
    dataCenterLaw: false, cryptoFriendly: true, sovereignSuitable: true,
    climateRisk: 'Low',
    notes: 'Adjacent to robust hydro grid. Excellent for sovereign/government workloads.',
  },
  {
    id: 'mt', state: 'MT', country: 'US', rank: 8,
    label: 'Montana',
    energyCostPerKwh: 0.044,
    taxIncentives: ['Property tax abatement for new industries', 'ARPA-funded fiber grants'],
    dataCenterLaw: false, cryptoFriendly: true, sovereignSuitable: true,
    climateRisk: 'Low',
    notes: 'Lowest ambient temperature in CONUS — natural cooling advantage. Fiber sparsity is primary risk.',
  },
  {
    id: 'co', state: 'CO', country: 'US', rank: 9,
    label: 'Colorado (Denver/Boulder)',
    energyCostPerKwh: 0.060,
    taxIncentives: ['Enterprise zone tax credits', 'Renewable energy SREC market'],
    dataCenterLaw: false, cryptoFriendly: true, sovereignSuitable: false,
    climateRisk: 'Low',
    notes: 'Excellent fiber and cloud on-ramps in Denver. 5,280 ft altitude — thinner air requires cooling adjustment.',
  },
  {
    id: 'il', state: 'IL', country: 'US', rank: 10,
    label: 'Illinois (Chicago)',
    energyCostPerKwh: 0.068,
    taxIncentives: ['Data Center Investment Tax Credit Act', 'Enterprise zone', 'EDGE program'],
    dataCenterLaw: true, cryptoFriendly: false, sovereignSuitable: false,
    climateRisk: 'Low',
    notes: 'Dense hyperscale presence in suburban IL. Strong financial infrastructure suitability. Prime for CME colocation and financial edge use cases.',
  },
]

export function getJurisdictionById(id: string): JurisdictionProfile | undefined {
  return JURISDICTIONS.find(j => j.id === id)
}

export function getJurisdictionByState(state: string): JurisdictionProfile | undefined {
  return JURISDICTIONS.find(j => j.state.toLowerCase() === state.toLowerCase())
}
