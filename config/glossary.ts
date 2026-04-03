// config/glossary.ts
// Data center industry terminology — 60+ definitions
// Source: UNYKORN-DataCenter-System-2026.md § Terms & Definitions

export interface GlossaryTerm {
  term: string
  abbreviation?: string
  definition: string
  category: 'power' | 'cooling' | 'network' | 'compliance' | 'financial' | 'operations' | 'environmental' | 'blockchain'
}

export const GLOSSARY: GlossaryTerm[] = [
  // Power
  { term: 'Power Usage Effectiveness', abbreviation: 'PUE', definition: 'Ratio of total facility power to IT equipment power. Industry average 1.58; best-in-class 1.2 or below. Lower is better.', category: 'power' },
  { term: 'Water Usage Effectiveness', abbreviation: 'WUE', definition: 'Liters of water per kWh of IT equipment energy. Targets sub-0.5L/kWh for AI campuses.', category: 'cooling' },
  { term: 'Behind-the-Meter', abbreviation: 'BTM', definition: 'Generation resources located on the customer side of the utility meter, bypassing transmission charges and T&D losses.', category: 'power' },
  { term: 'Distributed Flare Mitigation', abbreviation: 'DFM', definition: 'Crusoe Energy technology model: capturing stranded or flared natural gas from upstream oil & gas for on-site compute power, reducing GHG emissions while providing lowest-cost electricity.', category: 'power' },
  { term: 'Power Purchase Agreement', abbreviation: 'PPA', definition: 'Long-term contract between a renewable energy generator and the data center operator fixing the price per kWh over a defined term (typically 10–25 years).', category: 'power' },
  { term: 'Interconnection Queue', abbreviation: 'ICIQ', definition: 'The utility or ISO/RTO queue for processing new large load or generation interconnection studies. Lead times range from 12–60 months.', category: 'power' },
  { term: 'N+1 Redundancy', definition: 'One additional component beyond the minimum needed (N), providing a single backup. N+2 provides two backups. 2N provides full backup.', category: 'power' },
  { term: 'Uninterruptible Power Supply', abbreviation: 'UPS', definition: 'Battery-based system providing bridge power during utility outage until generators come online. Runtime typically 5–20 minutes.', category: 'power' },
  { term: 'Critical Load', definition: 'IT equipment power (servers, storage, networking) — the protected, UPS-backed load. Excludes cooling, lighting, admin.', category: 'power' },
  { term: 'Stranded Power', abbreviation: 'StrandedPwr', definition: 'Designed UPS or PDU capacity not currently utilized by IT loads — represents inefficiency and potential upside for new deployments.', category: 'power' },
  { term: 'Demand Response', abbreviation: 'DR', definition: 'Grid operator program allowing curtailment of facility load in exchange for energy credits or payments, typically during peak demand events.', category: 'power' },
  // Cooling
  { term: 'Cooling Distribution Unit', abbreviation: 'CDU', definition: 'Rack-level liquid cooling manifold that circulates chilled water or dielectric fluid directly to compute trays. Required for 40+ kW/rack densities.', category: 'cooling' },
  { term: 'Direct Liquid Cooling', abbreviation: 'DLC', definition: 'Method of cooling compute components by running liquid coolant directly over or through heat sinks — enables 30–100 kW/rack densities.', category: 'cooling' },
  { term: 'Immersion Cooling', definition: 'Complete submersion of servers in dielectric fluid. Single-phase uses synthetic oil; two-phase uses low-boiling-point fluid with vapor condensation. Enables 200+ kW/rack.', category: 'cooling' },
  { term: 'Computer Room Air Handler', abbreviation: 'CRAH', definition: 'Large refrigerant-cycle precision air conditioning unit used in raised-floor data center rows.', category: 'cooling' },
  { term: 'Evaporative Cooling', definition: 'Uses water evaporation to cool air or water, significantly lowering PUE in dry climates. Water-consumptive trade-off vs. lower energy use.', category: 'cooling' },
  // Network
  { term: 'Internet Exchange', abbreviation: 'IX', definition: 'Physical infrastructure enabling ISPs and networks to exchange internet traffic directly, reducing latency. IX proximity is critical for latency-sensitive workloads.', category: 'network' },
  { term: 'Meet-Me Room', abbreviation: 'MMR', definition: 'Neutral, secure space within a data center or carrier hotel where multiple carriers can cross-connect, enabling carrier diversity.', category: 'network' },
  { term: 'Dark Fiber', definition: 'Installed but unlit fiber optic cable leased directly for dedicated bandwidth. Provides highest capacity and lowest latency but requires self-provisioned wavelength equipment.', category: 'network' },
  { term: 'Wavelength Service', definition: 'Carrier-provisioned optical channel (100G–400G) over fiber — simpler than leasing dark fiber, less bandwidth than DWDM IRU.', category: 'network' },
  { term: 'Route Diversity', definition: 'Presence of two or more fiber paths entering the facility via physically separate conduits and routes, eliminating single points of failure.', category: 'network' },
  { term: 'Cross-Connect', abbreviation: 'XC', definition: 'Physical or virtual patch between two network ports within the same facility, typically used to link customer cages to carrier PoPs.', category: 'network' },
  // Compliance
  { term: 'SOC 2 Type II', definition: 'AICPA audit of a service organization\'s controls over one or more trust service criteria (security, availability, etc.) over a period of time (typically 6–12 months).', category: 'compliance' },
  { term: 'ISO/IEC 27001', definition: 'International Information Security Management System standard. Certifies that an organization manages information security systematically.', category: 'compliance' },
  { term: 'CJIS Security Policy', abbreviation: 'CJIS', definition: 'FBI Criminal Justice Information Services Security Policy — required for any facility hosting law enforcement or criminal justice data. Includes background check, physical security, and encryption requirements.', category: 'compliance' },
  { term: 'FedRAMP', definition: 'Federal Risk and Authorization Management Program — GSA-managed cybersecurity authorization for cloud services used by US Federal agencies.', category: 'compliance' },
  { term: 'Uptime Institute Tier', definition: 'Tier I–IV classification for data center infrastructure reliability. Tier III (99.98% uptime, concurrent maintainability) is the industry standard for enterprise DCs. Tier IV (99.995%) for mission-critical.', category: 'compliance' },
  // Financial
  { term: 'Debt Service Coverage Ratio', abbreviation: 'DSCR', definition: 'Net operating income divided by total debt service (principal + interest). Lenders typically require 1.25–1.50x for construction + perm loans.', category: 'financial' },
  { term: 'Loan-to-Value', abbreviation: 'LTV', definition: 'Ratio of loan amount to appraised value. Data center lenders typically allow 55–70% LTV depending on lease quality and facility maturity.', category: 'financial' },
  { term: 'Internal Rate of Return', abbreviation: 'IRR', definition: 'Discount rate at which the net present value of a project equals zero. Data center levered IRR targets typically 15–25%.', category: 'financial' },
  { term: 'New Markets Tax Credit', abbreviation: 'NMTC', definition: 'Federal tax credit program providing ~27 cents of benefit per $1 of NMTC allocation for projects in low-income communities — can offset 5–10% of CapEx.', category: 'financial' },
  { term: 'Investment Tax Credit', abbreviation: 'ITC', definition: 'Federal IRA-enhanced solar and storage ITC — 30–50% of eligible CapEx depending on location, wage, and apprenticeship requirements.', category: 'financial' },
  { term: 'TIFIA', definition: 'Transportation Infrastructure Finance and Innovation Act — federal low-cost credit program. Data center critical infrastructure projects may qualify for sub-market rates.', category: 'financial' },
  { term: 'Mezzanine Debt', abbreviation: 'Mezz', definition: 'Subordinated debt layer between senior debt and equity, typically carrying 12–18% interest rate, sometimes with equity kicker or warrants.', category: 'financial' },
  { term: 'Real World Asset', abbreviation: 'RWA', definition: 'Tokenized representation of physical or financial assets on a blockchain. Data center infrastructure can be tokenized as RWA for fractional ownership, liquidity, and programmable revenue sharing.', category: 'blockchain' },
  // Operations
  { term: 'Raised Floor', definition: 'Elevated computer floor with removable tiles allowing underfloor cable management and cold air distribution. Standard height 18–36 inches for enterprise DCs.', category: 'operations' },
  { term: 'Power Distribution Unit', abbreviation: 'PDU', definition: 'Rack-level or floor-level unit distributing power from UPS output to IT equipment with circuit-level monitoring.', category: 'operations' },
  { term: 'Operations Center', abbreviation: 'NOC/SOC', definition: 'Network Operations Center (NOC) monitors infrastructure; Security Operations Center (SOC) monitors for threats. Best-in-class facilities operate both 24/7.', category: 'operations' },
  { term: 'Cabinet / Rack Density', definition: 'Power consumption per rack in kilowatts. Standard enterprise: 5–10 kW. AI/HPC: 40–100 kW. Immersion cooling enables 200+ kW/rack.', category: 'operations' },
  { term: 'COLO', definition: 'Colocation — the practice of renting space, power, and cooling in a multi-tenant data center. As opposed to hyperscale (single-tenant, own-build).', category: 'operations' },
  // Environmental
  { term: 'Scope 1 Emissions', definition: 'Direct GHG emissions from owned or controlled sources — e.g., diesel generators, on-site gas combustion. Measured in tCO2e.', category: 'environmental' },
  { term: 'Scope 2 Emissions', definition: 'Indirect GHG emissions from purchased electricity. Market-based (using RECs) or location-based. Key target for renewable energy claims.', category: 'environmental' },
  { term: 'Renewable Energy Certificate', abbreviation: 'REC', definition: 'Tradeable certificate representing 1 MWh of renewable electricity generation. Bundled with PPAs or purchased separately to support Scope 2 reduction claims.', category: 'environmental' },
  { term: 'Chapter 313 / Texas Incentives', definition: 'Texas ad valorem tax limitation agreement for large capital investments (Chapter 313 predecessor). Provides up to 85% limitation on added appraised value for 10 years.', category: 'financial' },
  // Blockchain
  { term: 'Apostle Chain', definition: 'UnyKorn proprietary Layer-1 blockchain (chain_id 7332) for AI-to-AI settlement, RWA tokenization, and on-chain capital formation. Native token: ATP (APO).', category: 'blockchain' },
  { term: 'USDF', definition: 'UnyKorn stablecoin pegged 1:1 to USD, issued on Stellar + Apostle Chain. Used for data center infrastructure payments and RWA settlement.', category: 'blockchain' },
]

export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase()
  return GLOSSARY.filter(
    t => t.term.toLowerCase().includes(q) ||
         (t.abbreviation?.toLowerCase().includes(q) ?? false) ||
         t.definition.toLowerCase().includes(q)
  )
}

export function getGlossaryByCategory(cat: GlossaryTerm['category']): GlossaryTerm[] {
  return GLOSSARY.filter(t => t.category === cat)
}
