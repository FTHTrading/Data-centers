// config/energy-strategy.ts
// PPA structures, energy sourcing strategies, and BTM/DFM guidance
// Source: UNYKORN-DataCenter-System-2026.md § Power Purchase Agreements & Alternative Energy

export interface PpaStructure {
  id: string
  label: string
  description: string
  typicalTermYears: [number, number]
  priceRangePerKwh: [number, number]
  pros: string[]
  cons: string[]
  bestFor: string[]
}

export const PPA_STRUCTURES: PpaStructure[] = [
  {
    id: 'utility-scale-solar',
    label: 'Utility-Scale Solar PPA',
    description: 'Long-term fixed-price offtake agreement with a solar developer for dedicated grid-delivered renewables.',
    typicalTermYears: [15, 25],
    priceRangePerKwh: [0.028, 0.055],
    pros: ['Price certainty', 'RECs included', 'No CapEx for panels', 'Bankable for lenders'],
    cons: ['Intermittency requires grid backup', 'Contract lock-in', 'Developer credit risk'],
    bestFor: ['Greenfield AI campuses', 'ESG-mandated deployments', 'Large MW consumers'],
  },
  {
    id: 'wind-ppa',
    label: 'Wind Power PPA',
    description: 'Fixed or variable-rate offtake from onshore wind farm.',
    typicalTermYears: [15, 20],
    priceRangePerKwh: [0.025, 0.045],
    pros: ['Lowest $/kWh in ERCOT/PJM', 'Complements solar (different production profile)', 'RECs bankable'],
    cons: ['High curtailment risk in some markets', 'Geographic limitation', 'Shape mismatch'],
    bestFor: ['ERCOT West TX', 'PJM Midwest', 'Combined solar+wind portfolios'],
  },
  {
    id: 'nuclear-ppa',
    label: 'Nuclear PPA (PPSA / Direct)',
    description: 'Power Purchase and Sale Agreement directly with a nuclear operator for 24/7 carbon-free baseload.',
    typicalTermYears: [10, 20],
    priceRangePerKwh: [0.048, 0.075],
    pros: ['24/7 carbon-free', 'Baseload — eliminates intermittency', 'No grid curtailment'],
    cons: ['Higher $/kWh vs. solar/wind', 'Limited availability', 'Complex regulatory structure'],
    bestFor: ['AI campuses requiring 24/7 clean power', 'Hyperscale commitments', 'ESG-premium buyers'],
  },
  {
    id: 'btm-solar',
    label: 'Behind-the-Meter Solar + ESS',
    description: 'On-site or directly attached solar generation with battery energy storage system for self-supply.',
    typicalTermYears: [10, 25],
    priceRangePerKwh: [0.032, 0.060],
    pros: ['No transmission charges', 'Peak shaving', 'Grid independence buffer', 'REC + ITC eligible'],
    cons: ['Land requirement', 'CapEx heavy', 'Battery replacement cycle'],
    bestFor: ['Greenfield campuses with 50+ acres', 'Texas / Nevada / Arizona sites', 'DFM-adjacent sites'],
  },
  {
    id: 'dfm-natural-gas',
    label: 'Distributed Flare Mitigation (DFM)',
    description: 'Capture and utilize stranded or flared gas from oil & gas operations for on-site generation.',
    typicalTermYears: [5, 15],
    priceRangePerKwh: [0.018, 0.035],
    pros: ['Lowest unit cost available', 'Stranded asset utilization', 'ESG: flare reduction', 'No grid needed'],
    cons: ['Regulatory permitting complexity', 'Remote locations', 'Gas flow variability', 'Emissions reporting'],
    bestFor: ['Permian Basin, Bakken, Marcellus', 'Crusoe-model DFM deployments', 'Remote mining/ML inference'],
  },
  {
    id: 'hydro-direct',
    label: 'Hydroelectric Direct Access',
    description: 'Direct access agreement with a run-of-river or storage hydro facility for low-cost baseload.',
    typicalTermYears: [10, 30],
    priceRangePerKwh: [0.025, 0.045],
    pros: ['24/7 generation', 'Carbon-free', 'Stable pricing', 'Long asset life'],
    cons: ['Geographic limitation (Pacific NW, Southeast)', 'Drought risk', 'FERC/WECC complexity'],
    bestFor: ['Pacific Northwest (PNW)', 'Montana / Idaho / Oregon', 'Sovereign deployments'],
  },
]

// DFM (Distributed Flare Mitigation) — Crusoe Technology model parameters
// Source: Crusoe ESG Report 2024 + UNYKORN-DataCenter-System-2026.md
export const DFM_BASELINE = {
  co2AvoidedPerMwh: 0.82,    // tCO2e per MWh (vs. flaring baseline)
  typicalFleetMW: 200,        // MW deployed per Crusoe data
  energyFromFlaringPercent: 0.97,
  avgUptimePercent: 0.96,
  targetPUE: 1.18,
}

export const ENERGY_BENCHMARKS = {
  hyperscaleTargetPUE: 1.20,
  crusoe2023PUE: 1.18,
  industryAvgPUE: 1.58,
  targetWUE: 0.3,         // liters/kWh
  aiGpuThermalKwPerRack: 40,  // minimum for AI dense
  aiGpuThermalKwHpc: 100,     // H100 cluster typical
}
